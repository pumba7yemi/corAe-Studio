// corAe â€” OBARI API (Stage 3: Booking)
// GET  /api/business/oms/obari/booking  â†’ list staged snapshots
// POST /api/business/oms/obari/booking  â†’ confirm booking
//
// Notes:
// - Works with repo singleton under _singletons
// - Aligned with UI in apps/studio/app/business/oms/obari/booking/page.ts x
// - Keeps immutable staging, returns mock booking record for demo

import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/app/api/business/oms/obari/_singletons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingRecord = {
  booking_id: string;
  snapshot_id: string;
  direction: "inbound" | "outbound";
  order_no: string;
  when_iso: string;
  status: "booked";
};

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

/** GET â€” List staged orders for UI */
export async function GET() {
  try {
    const all = await repo.list();
    const staged = all
      .filter((s: any) => s.status === "staging")
      .map((s: any) => ({
        snapshot_id: s.snapshot_id,
        direction: s.direction,
        order_no: s.order_numbers.po_no || s.order_numbers.so_no || "â€”",
        schedule: s.schedule,
        transport: s.transport,
        lines: s.lines.map((l: any) => ({
          sku: l.sku,
          qty: l.qty,
          uom: l.uom,
          unit_price: l.unit_price,
        })),
        created_at_iso: s.created_at_iso,
      }));

    return NextResponse.json({ ok: true, staged });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to list staged" }, { status: 500 });
  }
}

/** POST â€” Confirm booking (demo) */
export async function POST(req: NextRequest) {
  try {
    const { snapshotId, whenISO } = (await req.json()) as {
      snapshotId: string;
      whenISO?: string;
    };

    if (!snapshotId) {
      return NextResponse.json({ ok: false, error: "snapshotId required" }, { status: 400 });
    }

    const snap = await repo.getById(snapshotId);
    if (!snap)
      return NextResponse.json({ ok: false, error: "snapshot not found" }, { status: 404 });

    const orderNo = snap.order_numbers?.po_no || snap.order_numbers?.so_no || "â€”";

    const booking: BookingRecord = {
      booking_id: id("BOOK"),
      snapshot_id: snap.snapshot_id,
      direction: snap.direction ?? "inbound",
      order_no: orderNo,
      when_iso: whenISO || new Date().toISOString(),
      status: "booked",
    };

    // For demo: do not mutate repo. In production: persist + advance OBARI stage.
    return NextResponse.json({ ok: true, booking });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed to book" }, { status: 400 });
  }
}
