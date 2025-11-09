// apps/studio/app/api/ship/business/oms/obari/invoice/list/route.ts
// OBARI — Invoice List (from FINAL "=" snapshots)
// Lists invoice-ready items by scanning .data/equals-final, ordered by `at` desc.
// Optional filters: dealId, bookingId. Simple stateless pagination via `cursor`.
//
// Query:
//   dealId?: string
//   bookingId?: string
//   limit?: number (default 20, max 100)
//   cursor?: string (base64 of numeric offset)
//
// Response:
//   { ok:true, items:[{dealId, bookingId, number, currency, at, hash, file}], nextCursor?: string }

import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

type FinalSnap = {
  dealId: string;
  bookingId?: string | null;
  number: string;
  baseHash: string;
  adjustedHash: string;
  hash: string;
  at: string;                // ISO
  stage: "REPORT";
  variant: "FINAL";
  currency: string;
  version: number;
  payload: string;           // canonical JSON
};

type ListItem = {
  dealId: string;
  bookingId: string | null;
  number: string;
  currency: string;
  at: string;
  hash: string;
  file: string;              // relative path
  version: number;
};

async function listFinalFiles(): Promise<string[]> {
  const dir = pathResolve(process.cwd(), ".data", "equals-final");
  try {
    const entries = await readdir(dir);
    const files: string[] = [];
    for (const name of entries) {
      const p = pathJoin(dir, name);
      try {
        const s = await stat(p);
        if (s.isFile() && p.endsWith(".json")) files.push(p);
      } catch { /* ignore */ }
    }
    return files;
  } catch {
    return [];
  }
}

async function readJsonSafe<T>(p: string): Promise<T | null> {
  try {
    const raw = await readFile(p, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// GET /api/ship/business/oms/obari/invoice/list
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dealId = url.searchParams.get("dealId")?.trim() || "";
    const bookingId = url.searchParams.get("bookingId")?.trim() || "";
    const limitParam = url.searchParams.get("limit");
    const cursorParam = url.searchParams.get("cursor");

    const limitRaw = limitParam ? Number(limitParam) : 20;
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(1, limitRaw), 100) : 20;

    const offset = cursorParam ? (() => {
      try {
        const n = Number(Buffer.from(cursorParam, "base64").toString("utf-8"));
        return Number.isFinite(n) && n >= 0 ? n : 0;
      } catch { return 0; }
    })() : 0;

    const files = await listFinalFiles();
    if (!files.length) {
      return NextResponse.json({ ok: true, items: [], nextCursor: null });
    }

    // Read + filter valid FINAL snaps
    const rows: Array<{ snap: FinalSnap; file: string }> = [];
    for (const f of files) {
      const j = await readJsonSafe<FinalSnap>(f);
      if (!j) continue;
      if (j.variant !== "FINAL" || typeof j.payload !== "string") continue;
      if (dealId && j.dealId !== dealId) continue;
      if (bookingId && (j.bookingId ?? "") !== bookingId) continue;
      rows.push({ snap: j, file: f });
    }

    // Sort by at desc, then hash for tie-breaker
    rows.sort((a, b) => {
      if (a.snap.at === b.snap.at) return a.snap.hash < b.snap.hash ? 1 : -1;
      return a.snap.at < b.snap.at ? 1 : -1;
    });

    // Paginate
    const slice = rows.slice(offset, offset + limit);
    const nextOffset = offset + slice.length;
    const hasMore = nextOffset < rows.length;
    const nextCursor = hasMore ? Buffer.from(String(nextOffset), "utf-8").toString("base64") : null;

    const items: ListItem[] = slice.map(({ snap, file }) => ({
      dealId: snap.dealId,
      bookingId: snap.bookingId ?? null,
      number: snap.number,
      currency: snap.currency,
      at: snap.at,
      hash: snap.hash,
      file: file.replace(process.cwd(), "."),
      version: snap.version,
    }));

    return NextResponse.json({ ok: true, items, nextCursor });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
