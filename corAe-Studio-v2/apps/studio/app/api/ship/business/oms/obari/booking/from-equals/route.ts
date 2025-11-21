// apps/studio/app/api/business/oms/obari/bookings/from-equals/route.ts
// Studio API â€” Booking-from-Equals (derives a booking DTO from the immutable "=" snapshot)
// No DB writes in this slice; returns a proposed booking JSON for downstream creation.

import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

// Types local to avoid alias issues
type EqualsSnapshot = {
  dealId: string;
  at: string;          // ISO timestamp
  stage: "BDO";
  number: string;      // BDO human code
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
    qty: string;        // canonicalized as string
    unitPrice: string;  // canonicalized as string
    taxRate: string;    // canonicalized as string
  }>;
  totals: { subtotal: string; taxTotal: string; total: string };
  meta: Record<string, unknown>;
};

type BookingDTO = {
  // Mirrors booking model shape, but DTO only (no DB id)
  dealId: string;
  number: string;             // derived from BDO number
  status: "tentative";
  orgId?: string | null;
  locationId?: string | null;
  startAt: string;            // ISO
  endAt: string;              // ISO
  resourceId?: string | null;
  capacity?: number | null;
  notes?: string | null;

  // Echo of commercial snapshot (read-only reference for the booking doc pack)
  commercial: {
    currency: string;
    totals: { subtotal: string; taxTotal: string; total: string };
    lineCount: number;
    topLines: Array<{ itemName: string; qty: string }>;
  };

  // Provenance
  equals: {
    hash: string;
    at: string;
    version: number;
  };
};

type PostBody = {
  dealId: string;
  startAt?: string;
  endAt?: string;
  resourceId?: string;
  capacity?: number;
  notes?: string;
};

function parseISOOr(nowPlusMinutes: number): string {
  const d = new Date(Date.now() + nowPlusMinutes * 60_000);
  return d.toISOString();
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
      // ignore malformed files
    }
  }
  if (snaps.length === 0) return null;

  snaps.sort((a, b) => (a.at < b.at ? 1 : -1));
  return snaps[0];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody;
    const dealId = body?.dealId?.trim();
    if (!dealId) {
      return NextResponse.json({ error: "dealId is required" }, { status: 400 });
    }

    const snap = await loadLatestEquals(dealId);
    if (!snap) {
      return NextResponse.json({ error: "Equals snapshot not found" }, { status: 404 });
    }

    let payload: EqualsPayload;
    try {
      payload = JSON.parse(snap.payload) as EqualsPayload;
    } catch {
      return NextResponse.json({ error: "Corrupt equals payload" }, { status: 422 });
    }

    // Derive booking number from BDO number with a suffix (deterministic, no DB)
    const suffixTime = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12); // YYYYMMDDHHMM
    const bookingNumber = `BK-${payload.number}-${suffixTime}`;

    // Schedule defaults if not provided
    const startAtISO = body.startAt ?? parseISOOr(15);   // default: now + 15m
    const endAtISO = body.endAt ?? parseISOOr(75);       // default: +60m duration

    const dto: BookingDTO = {
      dealId,
      number: bookingNumber,
      status: "tentative",
      orgId: payload.orgId,
      locationId: payload.locationId,
      startAt: startAtISO,
      endAt: endAtISO,
      resourceId: body.resourceId ?? null,
      capacity: typeof body.capacity === "number" ? body.capacity : null,
      notes: body.notes ?? null,

      commercial: {
        currency: payload.currency,
        totals: payload.totals,
        lineCount: payload.lines.length,
        topLines: payload.lines.slice(0, 3).map((l) => ({ itemName: l.itemName, qty: l.qty })),
      },

      equals: {
        hash: snap.hash,
        at: snap.at,
        version: snap.version,
      },
    };

    return NextResponse.json({ ok: true, booking: dto });
  } catch (e: any) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

