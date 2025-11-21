// apps/studio/app/api/business/oms/obari/thedeal/btdo/survey/list/route.ts
// BTDO â–¸ Survey List â€” list all initialized BTDO surveys in .data/btdo-surveys
// Supports optional query params: ?status=pending|accepted, ?party=vendor|client
// Returns: { ok, total, results:[...] }

import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

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

async function listFiles(dir: string): Promise<string[]> {
  try { return (await readdir(dir)).map(f => pathJoin(dir, f)); } catch { return []; }
}
async function readJsonSafe<T>(file: string): Promise<T | null> {
  try { return JSON.parse(await readFile(file, "utf-8")) as T; } catch { return null; }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const party = url.searchParams.get("party") as PartyType | null;

  const dir = pathResolve(process.cwd(), ".data", "btdo-surveys");
  const files = await listFiles(dir);
  const results: Array<{ surveyId: string; file: string; createdAt: string; expAt: string; partyType: PartyType; accepted: boolean }> = [];

  for (const f of files) {
    const d = await readJsonSafe<SurveyDraft>(f);
    if (!d?.surveyId) continue;
    const accepted = !!d.responses?.acceptance?.accepted;
    const ptype = d.party.type;
    if (status === "pending" && accepted) continue;
    if (status === "accepted" && !accepted) continue;
    if (party && ptype !== party) continue;

    results.push({
      surveyId: d.surveyId,
      file: f.replace(process.cwd(), "."),
      createdAt: d.createdAt,
      expAt: d.expAt,
      partyType: ptype,
      accepted,
    });
  }

  results.sort((a,b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({
    ok: true,
    total: results.length,
    filters: { status: status ?? "any", party: party ?? "any" },
    results,
  });
}

