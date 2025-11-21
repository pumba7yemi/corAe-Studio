// apps/studio/app/api/business/oms/obari/thedeal/btdo/survey/submit/route.ts
// BTDO â–¸ Survey Submit â€” merge responses into file-backed draft
// POST { token, responses:{...} } â†’ { ok, surveyId, stored:{quote,siteSurvey} }
// GET  ?surveyId=SVY-XXXX                â†’ { ok, draft }

import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual, createHmac } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve as resolvePath, join as joinPath } from "node:path";

const STORE_DIR = resolvePath(process.cwd(), ".data", "btdo-surveys");
const SECRET =
  process.env.BTDO_SURVEY_SECRET ||
  process.env.SHARED_LINK_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "DEV_ONLY_CHANGE_ME_FOR_PROD";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type PartyType = "vendor" | "client";
type SurveyDraft = {
  surveyId: string;
  token: string;
  createdAt: string;
  expAt: string;
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
    quote?: {
      price: string;
      currency?: string;
      discountPct?: string;
      netPrice?: string;
      basis?: string;
      validUntil?: string;
    };
    attachments?: Array<{ kind: string; url: string }>;
    acceptance?: { accepted: boolean; by?: string; at?: string; note?: string | null };
  };
};

type QuoteReq = {
  price: string;
  currency?: string;
  discountPct?: string;
  netPrice?: string;
  basis?: string;
  validUntil?: string;
};

type PostBody = {
  token: string;
  responses: Record<string, unknown>;
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ token helpers (match /init) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function sign(payload: string): string {
  return createHmac("sha256", Buffer.from(SECRET, "utf8")).update(payload).digest("hex");
}
function b64d<T = any>(s: string): T {
  return JSON.parse(Buffer.from(s, "base64url").toString("utf8")) as T;
}
function verifyToken(token: string): { ok: true; surveyId: string; dtdId: string } | { ok: false; reason: string } {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [payload, mac] = parts;
  const calc = sign(payload);
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(calc, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { ok: false, reason: "bad-signature" };
  const data = b64d<{ surveyId: string; exp: number; dtdId: string }>(payload);
  if (!data?.surveyId || !data?.exp || !data?.dtdId) return { ok: false, reason: "bad-payload" };
  if (Date.now() > data.exp) return { ok: false, reason: "expired" };
  return { ok: true, surveyId: data.surveyId, dtdId: data.dtdId };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ io â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
async function loadDraft(surveyId: string): Promise<SurveyDraft | null> {
  try {
    const raw = await readFile(joinPath(STORE_DIR, `${surveyId}.json`), "utf8");
    return JSON.parse(raw) as SurveyDraft;
  } catch {
    return null;
  }
}
async function saveDraft(draft: SurveyDraft) {
  await writeFile(joinPath(STORE_DIR, `${draft.surveyId}.json`), JSON.stringify(draft, null, 2), "utf8");
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ normalize known fields into quote/siteSurvey â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function normalizeResponses(draft: SurveyDraft, raw: Record<string, unknown>) {
  const currency = String(raw["currency"] ?? draft.commercial.currency ?? "USD");
  const price = raw["basePrice"] != null ? String(raw["basePrice"]) : undefined;
  const discountPct = raw["discount"] != null ? String(raw["discount"]) : undefined;
  const validity = raw["validity"] != null ? String(raw["validity"]) : undefined;
  const basis = raw["remarks"] != null ? String(raw["remarks"]) : undefined;

  // compute net price if possible
  let netPrice: string | undefined = undefined;
  if (price) {
    const p = Number(price);
    const d = discountPct ? Number(discountPct) : 0;
    if (Number.isFinite(p) && Number.isFinite(d)) netPrice = (p * (1 - d / 100)).toFixed(2);
  }

  const quote =
    price || validity || basis
      ? {
          price: price ?? "0",
          currency,
          discountPct,
          netPrice,
          basis,
          validUntil: validity,
        }
      : undefined;

  // keep everything else as siteSurvey
  const siteSurvey: Record<string, unknown> = {
    partyType: raw["partyType"],
    partyName: raw["partyName"],
    contact: raw["contact"] ?? raw["phone"] ?? raw["email"],
    location: raw["location"],
    accessNotes: raw["accessNotes"],
    preferredDate: raw["preferredDate"],
    description: raw["description"],
    qty: raw["qty"],
    unit: raw["unit"],
    siteNotes: raw["siteNotes"],
  };

  return { quote, siteSurvey };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ POST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PostBody;
    if (!body?.token) return NextResponse.json({ ok: false, error: "token required" }, { status: 400 });
    if (!body?.responses || typeof body.responses !== "object")
      return NextResponse.json({ ok: false, error: "responses required" }, { status: 400 });

    const v = verifyToken(body.token);
    if (!v.ok) return NextResponse.json({ ok: false, error: v.reason }, { status: 401 });

    const draft = await loadDraft(v.surveyId);
    if (!draft) return NextResponse.json({ ok: false, error: "survey not found" }, { status: 404 });

    // only accept matching generation (payload part before '.')
    if (draft.token.split(".")[0] !== body.token.split(".")[0]) {
      return NextResponse.json({ ok: false, error: "superseded token" }, { status: 409 });
    }

    const { quote, siteSurvey } = normalizeResponses(draft, body.responses);

    const qPartial = { ...(draft.responses?.quote ?? {}), ...(quote ?? {}) } as Partial<QuoteReq>;
    const qNormalized: QuoteReq = {
      price: qPartial.price ?? "",
      currency: qPartial.currency,
      discountPct: qPartial.discountPct,
      netPrice: qPartial.netPrice,
      basis: qPartial.basis,
      validUntil: qPartial.validUntil,
    };

    const merged: SurveyDraft = {
      ...draft,
      responses: {
        ...(draft.responses ?? {}),
        siteSurvey: { ...(draft.responses?.siteSurvey ?? {}), ...siteSurvey },
        quote: qNormalized,
      },
    };

    await saveDraft(merged);

    return NextResponse.json({
      ok: true,
      surveyId: merged.surveyId,
      stored: {
        quote: merged.responses?.quote ?? null,
        siteSurvey: merged.responses?.siteSurvey ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "submit_failed" }, { status: 500 });
  }
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ GET (dev aid) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export async function GET(req: NextRequest) {
  const surveyId = req.nextUrl.searchParams.get("surveyId");
  if (!surveyId) return NextResponse.json({ ok: false, error: "surveyId required" }, { status: 400 });
  const draft = await loadDraft(surveyId);
  if (!draft) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, draft });
}

