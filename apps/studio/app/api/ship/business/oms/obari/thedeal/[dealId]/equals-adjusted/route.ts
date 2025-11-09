// apps/studio/app/api/ship/business/oms/obari/deal/[dealId]/equals-adjusted/route.ts
// Studio API — Equals Adjusted Reader (REPORT_ADJUSTED snapshots from .data/equals-adjusted)

import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

type AdjustedSnap = {
  dealId: string;
  bookingId: string;
  number: string;         // BDO human code
  baseHash: string;
  hash: string;
  variant: "REPORT_ADJUSTED";
  at: string;             // ISO
  version: number;
  payload: string;        // canonical JSON (stringified)
};

async function loadAdjusted(dealId: string): Promise<AdjustedSnap[]> {
  const dir = pathResolve(process.cwd(), ".data", "equals-adjusted");
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const matches = files.filter((f) => f.startsWith(`${dealId}-`) && f.endsWith(".json"));
  if (matches.length === 0) return [];

  const snaps: AdjustedSnap[] = [];
  for (const name of matches) {
    try {
      const raw = await readFile(pathJoin(dir, name), "utf-8");
      const parsed = JSON.parse(raw) as any;
      if (
        parsed?.dealId === dealId &&
        parsed?.variant === "REPORT_ADJUSTED" &&
        typeof parsed?.payload === "string"
      ) {
        snaps.push({
          dealId: parsed.dealId,
          bookingId: parsed.bookingId,
          number: parsed.number,
          baseHash: parsed.baseHash,
          hash: parsed.hash,
          variant: "REPORT_ADJUSTED",
          at: parsed.at,
          version: parsed.version,
          payload: parsed.payload,
        });
      }
    } catch {
      // ignore malformed
    }
  }
  // newest first
  snaps.sort((a, b) => (a.at < b.at ? 1 : -1));
  return snaps;
}

// GET /api/ship/business/oms/obari/deals/:dealId/equals-adjusted?bookingId=...
export async function GET(req: Request, ctx: { params: Promise<{ dealId: string }> }) {
  try {
    const { dealId } = await ctx.params;
    if (!dealId || typeof dealId !== "string" || dealId.trim() === "") {
      return NextResponse.json({ error: "Missing dealId in path" }, { status: 400 });
    }

    const url = new URL(req.url);
    const bookingId = url.searchParams.get("bookingId")?.trim() || null;

    const snaps = await loadAdjusted(dealId);
    if (snaps.length === 0) {
      return NextResponse.json({ error: "No adjusted snapshots found" }, { status: 404 });
    }

    const items = bookingId ? snaps.filter((s) => s.bookingId === bookingId) : snaps;
    if (items.length === 0) {
      return NextResponse.json({ error: "No adjusted snapshots for the given filter" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      dealId,
      count: items.length,
      items: items.map((s) => ({
        dealId: s.dealId,
        bookingId: s.bookingId,
        number: s.number,
        baseHash: s.baseHash,
        hash: s.hash,
        at: s.at,
        version: s.version,
        // payload is large; expose but keep as string for canonical parse client-side
        payload: s.payload,
      })),
    });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}