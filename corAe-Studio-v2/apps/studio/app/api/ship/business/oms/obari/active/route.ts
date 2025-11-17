// apps/studio/apps/ship/app/api/ship/business/oms/obari/active/route.ts
// OBARI — Active API (Stage 4)

import { NextRequest, NextResponse } from "next/server";

type OrderStagingSnapshot = {
  snapshot_id: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  totals: { subtotal: number; lines: number };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* --------------------------- Types & Helpers --------------------------- */

type ActiveStatus = "in_progress" | "paused" | "completed" | "cancelled";

export interface ActiveEvent {
  at_iso: string;
  kind: "started" | "paused" | "resumed" | "completed" | "cancelled" | "note";
  note?: string;
  by?: string;
}

export interface ActiveRecord {
  active_id: string;
  source_snapshot_id: string;
  booking_id?: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  status: ActiveStatus;
  started_at_iso: string;
  updated_at_iso: string;
  totals: { subtotal: number; lines: number };
  events: ActiveEvent[];
}

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

/* ------------------------------ Repo (mem) ----------------------------- */

class MemoryActiveRepo {
  private map = new Map<string, ActiveRecord>();

  async list(): Promise<ActiveRecord[]> {
    return Array.from(this.map.values()).sort(
      (a, b) => a.started_at_iso.localeCompare(b.started_at_iso) * -1
    );
  }
  async get(id: string): Promise<ActiveRecord | undefined> {
    return this.map.get(id);
  }
  async put(a: ActiveRecord): Promise<void> {
    this.map.set(a.active_id, a);
  }
  async patch(id: string, status?: ActiveStatus, event?: ActiveEvent): Promise<ActiveRecord> {
    const cur = this.map.get(id);
    if (!cur) throw new Error("active record not found");
    const next: ActiveRecord = {
      ...cur,
      status: status ?? cur.status,
      updated_at_iso: nowISO(),
      events: event ? [...cur.events, event] : cur.events,
    };
    this.map.set(id, next);
    return next;
  }
}

const repo = new MemoryActiveRepo();

/* -------------------------- Factory (from input) ----------------------- */

type BookingRecordLight = {
  booking_id: string;
  source_snapshot_id: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  totals: { subtotal: number; lines: number };
};

function fromStaging(s: OrderStagingSnapshot, bookingId?: string): ActiveRecord {
  const ev: ActiveEvent = { at_iso: nowISO(), kind: "started" };
  return {
    active_id: id("ACT"),
    source_snapshot_id: s.snapshot_id,
    booking_id: bookingId,
    direction: s.direction,
    order_numbers: s.order_numbers,
    parties: { counterparty_name: s.parties.counterparty_name, our_name: s.parties.our_name },
    status: "in_progress",
    started_at_iso: nowISO(),
    updated_at_iso: nowISO(),
    totals: { subtotal: s.totals.subtotal, lines: s.totals.lines },
    events: [ev],
  };
}

function fromBooking(b: BookingRecordLight, snapshot?: OrderStagingSnapshot): ActiveRecord {
  const ev: ActiveEvent = { at_iso: nowISO(), kind: "started" };
  return {
    active_id: id("ACT"),
    source_snapshot_id: snapshot?.snapshot_id ?? b.source_snapshot_id,
    booking_id: b.booking_id,
    direction: b.direction,
    order_numbers: b.order_numbers,
    parties: b.parties,
    status: "in_progress",
    started_at_iso: nowISO(),
    updated_at_iso: nowISO(),
    totals: snapshot
      ? { subtotal: snapshot.totals.subtotal, lines: snapshot.totals.lines }
      : b.totals,
    events: [ev],
  };
}

/* --------------------------------- GET --------------------------------- */
// GET /api/ship/business/oms/obari/active
// GET /api/ship/business/oms/obari/active?id=ACT_xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const item = await repo.get(id);
    if (!item) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, active: item });
  }

  const items = await repo.list();
  return NextResponse.json({ ok: true, items });
}

/* --------------------------------- POST -------------------------------- */
// Body:
// { from_snapshot: OrderStagingSnapshot, booking_id?: string }
// OR
// { from_booking: BookingRecordLight, snapshot?: OrderStagingSnapshot }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let active: ActiveRecord | null = null;

    if (body?.from_snapshot?.snapshot_id) {
      active = fromStaging(body.from_snapshot as OrderStagingSnapshot, body?.booking_id);
    } else if (body?.from_booking?.booking_id) {
      const b = body.from_booking as BookingRecordLight;
      active = fromBooking(b, body?.snapshot as OrderStagingSnapshot | undefined);
    }

    if (!active) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload. Provide from_snapshot or from_booking." },
        { status: 400 }
      );
    }

    await repo.put(active);
    return NextResponse.json({ ok: true, active });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed to activate" }, { status: 400 });
  }
}

/* -------------------------------- PATCH -------------------------------- */
// Body: { id:"ACT_*", op:"pause"|"resume"|"complete"|"cancel"|"note", note?:string, by?:string }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id || "");
    const op = String(body?.op || "");

    if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

    let status: ActiveStatus | undefined;
    let kind: ActiveEvent["kind"];

    switch (op) {
      case "pause":   status = "paused";      kind = "paused";    break;
      case "resume":  status = "in_progress"; kind = "resumed";   break;
      case "complete":status = "completed";   kind = "completed"; break;
      case "cancel":  status = "cancelled";   kind = "cancelled"; break;
      case "note":    status = undefined;     kind = "note";      break;
      default:
        return NextResponse.json({ ok: false, error: "invalid op" }, { status: 400 });
    }

    const event: ActiveEvent = {
      at_iso: nowISO(),
      kind,
      note: typeof body?.note === "string" ? body.note : undefined,
      by: typeof body?.by === "string" ? body.by : undefined,
    };

    const updated = await repo.patch(id, status, event);
    return NextResponse.json({ ok: true, active: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed to update active" }, { status: 400 });
  }
}