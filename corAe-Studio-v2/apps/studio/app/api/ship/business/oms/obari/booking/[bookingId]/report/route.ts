// apps/studio/app/api/business/oms/obari/bookings/[bookingId]/report/route.ts
// Studio API â€” Reporting Adjust: apply a multiplier to the Deal's immutable "=" snapshot,
// persist an adjusted (read-only) snapshot for reporting/reconciliation, and return it.

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";
import { createHash } from "node:crypto";

// ---- Prisma singleton (dev-safe)
declare global {
  // eslint-disable-next-line no-var
  var __studio_prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient =
  global.__studio_prisma__ ?? (global.__studio_prisma__ = new PrismaClient());

// ---- Types (local â€” no alias risk)
type EqualsSnapshot = {
  dealId: string;
  at: string;          // ISO timestamp
  stage: "BDO";
  number: string;
  currency: string;
  payload: string;     // canonical JSON string
  hash: string;        // sha256(payload)
  version: number;
};

type EqualsPayload = {
  dealId: string;
  number: string;
  stage: "BDO" | "BTDO";
  status: "draft" | "proposed" | "approved" | "confirmed";
  orgId: string | null;
  locationId: string | null;
  customerId: string | null;
  vendorId: string | null;
  currency: string;
  lines: Array<{
    sku: string | null;
    itemName: string;
    qty: string;        // canonicalized
    unitPrice: string;  // canonicalized
    taxRate: string;    // canonicalized
  }>;
  totals: { subtotal: string; taxTotal: string; total: string };
  meta: Record<string, unknown>;
};

type PostBody = {
  multiplier: number;                 // e.g., 0.5 (half), 1.1 (10% over), 3.5 (weight-based)
  note?: string | null;
  docs?: Array<{ kind: string; url?: string; ref?: string }>;
};

// ---- Helpers
function toFixedStr(n: number, dp = 2) {
  return n.toFixed(dp);
}
function asNum(x: string | number): number {
  const v = typeof x === "string" ? Number(x) : x;
  return Number.isFinite(v) ? v : 0;
}
function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
function canonicalize(obj: unknown): string {
  // stable stringify (simple; lines order stable by mapping then JSON.stringify)
  return JSON.stringify(obj, Object.keys(obj as any).sort());
}
async function loadLatestEquals(dealId: string): Promise<EqualsSnapshot | null> {
  const dir = pathResolve(process.cwd(), ".data", "equals");
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return null;
  }
  const candidates = files.filter((f) => f.startsWith(`${dealId}-`) && f.endsWith(".json"));
  if (candidates.length === 0) return null;

  const snaps: EqualsSnapshot[] = [];
  for (const name of candidates) {
    try {
      const raw = await readFile(pathJoin(dir, name), "utf-8");
      const snap = JSON.parse(raw) as EqualsSnapshot;
      if (snap?.dealId === dealId && snap.stage === "BDO" && typeof snap.payload === "string") {
        snaps.push(snap);
      }
    } catch {
      // ignore malformed
    }
  }
  if (snaps.length === 0) return null;
  snaps.sort((a, b) => (a.at < b.at ? 1 : -1));
  return snaps[0];
}

// ---- Route
export async function POST(req: Request, ctx: { params: Promise<{ bookingId: string }> }) {
  try {
    const { bookingId } = await ctx.params;
    if (!bookingId || typeof bookingId !== "string" || bookingId.trim() === "") {
      return NextResponse.json({ error: "Missing bookingId in path" }, { status: 400 });
    }

    // 1) Validate booking + resolve deal
    const booking = await (prisma as any).booking.findUnique({
      where: { id: bookingId },
      select: { id: true, dealId: true, number: true, startAt: true, endAt: true },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2) Parse body
    const body = (await req.json()) as PostBody;
    const m = Number(body?.multiplier);
    if (!Number.isFinite(m) || m <= 0) {
      return NextResponse.json({ error: "multiplier must be a positive number" }, { status: 400 });
    }

    // 3) Load base equals snapshot for the Deal
    const baseSnap = await loadLatestEquals(booking.dealId);
    if (!baseSnap) {
      return NextResponse.json({ error: "Equals snapshot not found for deal" }, { status: 404 });
    }

    // 4) Parse equals payload and apply multiplier
    let basePayload: EqualsPayload;
    try {
      basePayload = JSON.parse(baseSnap.payload) as EqualsPayload;
    } catch {
      return NextResponse.json({ error: "Corrupt equals payload" }, { status: 422 });
    }

    // Multiply quantities and recompute totals
    const adjLines = basePayload.lines.map((l) => {
      const qty = asNum(l.qty) * m;
      return { ...l, qty: toFixedStr(qty, 3) }; // keep 3dp for quantities (weights)
    });

    const subtotal = adjLines.reduce((acc, l) => {
      const q = asNum(l.qty);
      const p = asNum(l.unitPrice);
      return acc + q * p;
    }, 0);

    const taxTotal = adjLines.reduce((acc, l) => {
      const q = asNum(l.qty);
      const p = asNum(l.unitPrice);
      const rate = asNum(l.taxRate) / 100;
      return acc + q * p * rate;
    }, 0);

    const total = subtotal + taxTotal;

    const docRefs = Array.isArray(body.docs) ? body.docs : [];

    const adjustedPayload = {
      ...basePayload,
      // Lock commercial values to the adjusted numbers
      lines: adjLines,
      totals: {
        subtotal: toFixedStr(subtotal, 2),
        taxTotal: toFixedStr(taxTotal, 2),
        total: toFixedStr(total, 2),
      },
      meta: {
        ...(basePayload.meta ?? {}),
        equals_adjust: {
          baseHash: baseSnap.hash,
          multiplier: m,
          bookingId: booking.id,
          bookingNumber: booking.number,
          note: body?.note ?? null,
          docs: docRefs, // references to POD/Receipt/Invoice etc
          at: new Date().toISOString(),
        },
      },
    };

    const canonical = JSON.stringify(adjustedPayload); // payload is already flat-enough; keep stable
    const adjusted: EqualsSnapshot & {
      baseHash: string;
      variant: "REPORT_ADJUSTED";
      bookingId: string;
    } = {
      dealId: baseSnap.dealId,
      at: new Date().toISOString(),
      stage: "BDO", // remains BDO context; this is an adjusted commercial view
      number: baseSnap.number,
      currency: baseSnap.currency,
      payload: canonical,
      hash: sha256(canonical),
      version: baseSnap.version + 1,
      baseHash: baseSnap.hash,
      variant: "REPORT_ADJUSTED",
      bookingId: booking.id,
    };

    // 5) Persist adjusted snapshot (content-addressed)
    const dir = pathResolve(process.cwd(), ".data", "equals-adjusted");
    await mkdir(dir, { recursive: true });
    const filename = `${adjusted.dealId}-${adjusted.hash.slice(0, 16)}-rpt.json`;
    const filepath = pathJoin(dir, filename);
    await writeFile(filepath, JSON.stringify(adjusted, null, 2), {
      encoding: "utf-8",
      flag: "wx", // immutable; fail if exists
    }).catch((err: any) => {
      if (err?.code === "EEXIST") {
        // treat as idempotent success
        return;
      }
      throw err;
    });

    return NextResponse.json({
      ok: true,
      adjusted: {
        dealId: adjusted.dealId,
        bookingId: adjusted.bookingId,
        number: adjusted.number,
        baseHash: adjusted.baseHash,
        hash: adjusted.hash,
        variant: adjusted.variant,
        at: adjusted.at,
        version: adjusted.version,
        file: `.data/equals-adjusted/${filename}`,
        payload: adjusted.payload, // canonical JSON consumers should parse
      },
    });
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
