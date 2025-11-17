// apps/studio/app/api/ship/business/oms/obari/deal/btdo/survey/[surveyId]/route.ts
// BTDO ▸ Survey Detail — GET view, POST refresh token, DELETE revoke
// File-backed store: .data/btdo-surveys/SVY-*.json

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve as resolvePath, join as joinPath } from "node:path";
import { createHmac, randomBytes } from "node:crypto";

const STORE_DIR = resolvePath(process.cwd(), ".data", "btdo-surveys");
const SECRET =
  process.env.BTDO_SURVEY_SECRET ||
  process.env.SHARED_LINK_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "DEV_ONLY_CHANGE_ME_FOR_PROD";

// ───────────────── types ─────────────────
type PartyType = "vendor" | "client";
type SurveyDraft = {
  surveyId: string;
  token: string;           // base64url(payload) + "." + sha256hex
  createdAt: string;       // ISO
  expAt: string;           // ISO
  dtdId: string;
  party: { type: PartyType; name?: string | null; contact?: any };
  commercial: {
    currency: string;
    schedule: "28-day" | "monthly" | "ad-hoc";
    items: Array<{ sku?: string | null; description: string; qty: string; uom?: string | null }>;
  };
  logistics: { location?: string | null; notes?: string | null };
  responses?: {
    siteSurvey?: Record<string, unknown>;
    quote?: { price: string; currency?: string; discountPct?: string; netPrice?: string; basis?: string; validUntil?: string };
    attachments?: Array<{ kind: string; url: string }>;
    acceptance?: { accepted: boolean; by?: string; at?: string; note?: string | null };
  };
};

type PostBody =
  | { action: "refreshToken"; ttlMinutes?: number }
  | { action: "renameParty"; name: string }
  | { action: "updateContact"; contact: any };

// ─────────────── helpers ───────────────
async function loadDraft(surveyId: string): Promise<SurveyDraft | null> {
  try {
    const raw = await readFile(joinPath(STORE_DIR, `${surveyId}.json`), "utf8");
    return JSON.parse(raw) as SurveyDraft;
  } catch {
    return null;
  }
}
async function saveDraft(d: SurveyDraft) {
  await writeFile(joinPath(STORE_DIR, `${d.surveyId}.json`), JSON.stringify(d, null, 2), "utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", Buffer.from(SECRET, "utf8")).update(payload).digest("hex");
}
function b64e(obj: any): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}
function mintToken(surveyId: string, dtdId: string, ttlMinutes: number) {
  const exp = Date.now() + Math.max(1, ttlMinutes) * 60_000;
  const payload = b64e({ surveyId, dtdId, exp, nonce: randomBytes(8).toString("hex") });
  const mac = sign(payload);
  return { token: `${payload}.${mac}`, expAt: new Date(exp).toISOString() };
}
function redactToken(t: string) {
  const [p, m] = String(t || "").split(".");
  return p ? `${p.slice(0, 8)}….${(m || "").slice(0, 8)}…` : "—";
}

// ─────────────── GET ───────────────
export async function GET(_req: NextRequest, ctx: { params: Promise<{ surveyid: string }> }) {
  const { surveyid } = await ctx.params;
  const surveyId = surveyid;
  const draft = await loadDraft(surveyId);
  if (!draft) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    survey: {
      surveyId: draft.surveyId,
      dtdId: draft.dtdId,
      createdAt: draft.createdAt,
      expAt: draft.expAt,
      token: redactToken(draft.token),
      party: draft.party,
      commercial: draft.commercial,
      logistics: draft.logistics,
      responses: {
        hasSiteSurvey: !!draft.responses?.siteSurvey,
        hasQuote: !!draft.responses?.quote,
        accepted: !!draft.responses?.acceptance?.accepted,
        acceptance: draft.responses?.acceptance ?? null,
      },
      file: `.data/btdo-surveys/${draft.surveyId}.json`,
    },
  });
}

// ─────────────── POST ───────────────
export async function POST(req: NextRequest, ctx: { params: Promise<{ surveyid: string }> }) {
  const { surveyid } = await ctx.params;
  const surveyId = surveyid;
  const draft = await loadDraft(surveyId);
  if (!draft) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

  const body = (await req.json().catch(() => null)) as PostBody | null;
  if (!body || typeof body !== "object" || !("action" in body)) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  if (body.action === "refreshToken") {
    const ttl = Number.isFinite(body.ttlMinutes as number) ? (body.ttlMinutes as number) : 60 * 24; // default 24h
    const { token, expAt } = mintToken(draft.surveyId, draft.dtdId, ttl);
    draft.token = token;
    draft.expAt = expAt;
    await saveDraft(draft);
    return NextResponse.json({
      ok: true,
      surveyId,
      token,
      expAt,
      redacted: redactToken(token),
    });
  }

  if (body.action === "renameParty") {
    draft.party.name = body.name;
    await saveDraft(draft);
    return NextResponse.json({ ok: true, surveyId, party: draft.party });
  }

  if (body.action === "updateContact") {
    draft.party.contact = body.contact;
    await saveDraft(draft);
    return NextResponse.json({ ok: true, surveyId, party: draft.party });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}

// ─────────────── DELETE ───────────────
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ surveyid: string }> }) {
  const { surveyid } = await ctx.params;
  const surveyId = surveyid;
  try {
    await unlink(joinPath(STORE_DIR, `${surveyId}.json`));
    return NextResponse.json({ ok: true, surveyId, deleted: true });
  } catch {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
}