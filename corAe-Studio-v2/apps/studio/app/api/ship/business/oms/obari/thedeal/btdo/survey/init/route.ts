// apps/studio/app/api/ship/business/oms/obari/thedeal/btdo/survey/init/route.ts
// BTDO ▸ Survey Init — create a new BTDO survey draft and mint token
// POST { dtdId, partyType, partyName?, contact?, schedule?, currency?, items?:[...] }
// Returns: { ok, surveyId, token, expAt, file }

import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve as resolvePath, join as joinPath } from "node:path";
import { randomUUID, createHmac } from "node:crypto";

const STORE_DIR = resolvePath(process.cwd(), ".data", "btdo-surveys");
const SECRET =
  process.env.BTDO_SURVEY_SECRET ||
  process.env.SHARED_LINK_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "DEV_ONLY_CHANGE_ME_FOR_PROD";

type PartyType = "vendor" | "client";
type InitBody = {
  dtdId: string;
  partyType: PartyType;
  partyName?: string;
  contact?: any;
  schedule?: "28-day" | "monthly" | "ad-hoc";
  currency?: string;
  items?: Array<{ sku?: string | null; description: string; qty: string; uom?: string | null }>;
  ttlMinutes?: number;
};

function sign(payload: string): string {
  return createHmac("sha256", Buffer.from(SECRET, "utf8")).update(payload).digest("hex");
}
function b64e(obj: any): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}
function mintToken(surveyId: string, dtdId: string, ttlMinutes: number) {
  const exp = Date.now() + Math.max(1, ttlMinutes) * 60_000;
  const payload = b64e({ surveyId, dtdId, exp });
  const mac = sign(payload);
  return { token: `${payload}.${mac}`, expAt: new Date(exp).toISOString() };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as InitBody | null;
    if (!body?.dtdId || !body?.partyType)
      return NextResponse.json({ ok: false, error: "dtdId and partyType required" }, { status: 400 });

    const surveyId = `SVY-${randomUUID().slice(0, 8).toUpperCase()}`;
    const { token, expAt } = mintToken(surveyId, body.dtdId, body.ttlMinutes ?? 60 * 24);

    const draft = {
      surveyId,
      token,
      createdAt: new Date().toISOString(),
      expAt,
      dtdId: body.dtdId,
      party: {
        type: body.partyType,
        name: body.partyName ?? null,
        contact: body.contact ?? null,
      },
      commercial: {
        currency: body.currency ?? "USD",
        schedule: body.schedule ?? "28-day",
        items:
          body.items?.length && Array.isArray(body.items)
            ? body.items
            : [{ description: "Sample item", qty: "1", uom: "unit" }],
      },
      logistics: { location: null, notes: null },
      responses: {},
    };

    await mkdir(STORE_DIR, { recursive: true });
    const file = joinPath(STORE_DIR, `${surveyId}.json`);
    await writeFile(file, JSON.stringify(draft, null, 2), "utf8");

    return NextResponse.json({
      ok: true,
      surveyId,
      token,
      expAt,
      file: file.replace(process.cwd(), "."),
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "init_failed" }, { status: 500 });
  }
}
