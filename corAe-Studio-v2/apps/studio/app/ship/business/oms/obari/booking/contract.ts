// apps/studio/apps/ship/app/business/oms/obari/booking/contract.ts
// OBARI — Booking Stage (after Order Staging)
// Purpose:
//   - Convert an immutable Order Staging Snapshot into a Booking record.
//   - Assign resources (fleet/driver/crew/slot) and issue a Booking Confirmation.
//   - Keep lineage to Order snapshot; forward-only invariants.
// Notes:
//   - Money in minor units; no IO here (pure domain).

import type {
  OrderStagingSnapshot,
  TransportFlag,
} from "../order/staging/contract";

/* ============================== Types ============================== */

export type BookingId = string;

export type BookingMode = "collection" | "delivery" | "service" | "job";

export interface TimeWindow {
  start_iso: string; // ISO8601
  end_iso: string;   // ISO8601
}

export interface ResourceRef {
  kind: "vehicle" | "driver" | "crew" | "plant" | "dock";
  id: string;
  label?: string;
}

export interface BookingAssignment {
  mode: BookingMode;
  window: TimeWindow;
  resources: ResourceRef[]; // e.g., [{kind:"vehicle",id:"TRK-12"}, {kind:"driver",id:"DRV-88"}]
  depot_id?: string;
  route_code?: string;
}

export interface BookingConfirmation {
  booking_id: BookingId;
  confirmation_ref: string; // human ref (e.g., BK-YYYYMMDD-####)
  snapshot_ref: string;     // lineage to Order snapshot
  issued_at_iso: string;
}

export type BookingStatus =
  | "planned"     // assigned but not yet dispatched
  | "confirmed"   // confirmed with counterparty
  | "en_route"    // active transit/execution
  | "complete"    // finished (handover/proof)
  | "cancelled";  // voided (with reason)

export interface BookingRecord {
  booking_id: BookingId;
  from_snapshot: OrderStagingSnapshot;
  transport_flag: TransportFlag;
  assignment: BookingAssignment;
  status: BookingStatus;
  confirmation?: BookingConfirmation;
  notes?: string;
  created_at_iso: string;
  updated_at_iso: string;
}

/* ============================== Utils ============================== */

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const pad = (n: number, w = 4) => String(n).padStart(w, "0");

export interface Clock { now: () => Date }
const sysClock: Clock = { now: () => new Date() };

export interface Sequence {
  nextBookingNumber: () => number;
}

export function makeConfirmationRef(seq: Sequence, clock: Clock = sysClock): string {
  const d = clock.now();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `BK-${y}${m}${dd}-${pad(seq.nextBookingNumber())}`;
}

/* ============================= Invariants ============================= */

function assertForwardFromStaging(s: OrderStagingSnapshot) {
  if (s.status !== "staging") {
    throw new Error("Booking can only be created from a staging snapshot.");
  }
}

function validateWindow(w: TimeWindow) {
  const a = new Date(w.start_iso).getTime();
  const b = new Date(w.end_iso).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) {
    throw new Error("Invalid booking window (end must be after start).");
  }
}

function inferMode(s: OrderStagingSnapshot): BookingMode {
  // Heuristic based on transport + direction; can be refined by product family later.
  if (s.direction === "inbound") return "collection";
  if (s.direction === "outbound") return "delivery";
  return "job";
}

/* ============================== Factory ============================== */

export interface CreateBookingInput {
  snapshot: OrderStagingSnapshot;
  window: TimeWindow;               // concrete time window chosen
  resources: ResourceRef[];         // at least one tangible resource
  depot_id?: string;
  route_code?: string;
  notes?: string;
}

export function createBooking(
  input: CreateBookingInput,
  seq: Sequence,
  clock: Clock = sysClock
): BookingRecord {
  assertForwardFromStaging(input.snapshot);
  validateWindow(input.window);
  if (!input.resources?.length) throw new Error("At least one resource must be assigned.");

  const now = clock.now().toISOString();
  const assignment: BookingAssignment = {
    mode: inferMode(input.snapshot),
    window: input.window,
    resources: input.resources,
    depot_id: input.depot_id,
    route_code: input.route_code,
  };

  const booking: BookingRecord = {
    booking_id: id("BK"),
    from_snapshot: input.snapshot,
    transport_flag: detectTransportFlag(input.snapshot),
    assignment,
    status: "planned",
    notes: input.notes,
    created_at_iso: now,
    updated_at_iso: now,
  };

  // Auto-confirm if window is within the staged cadence and no extra approval needed
  // (Policy hook point; for now we leave as planned)
  return booking;
}

/* ============================== Commands ============================== */

export function confirmBooking(
  b: BookingRecord,
  seq: Sequence,
  clock: Clock = sysClock
): BookingRecord {
  if (b.status === "cancelled" || b.status === "complete") {
    throw new Error(`Cannot confirm a ${b.status} booking.`);
  }
  const ref = makeConfirmationRef(seq, clock);
  const now = clock.now().toISOString();
  return {
    ...b,
    status: "confirmed",
    confirmation: {
      booking_id: b.booking_id,
      confirmation_ref: ref,
      snapshot_ref: b.from_snapshot.snapshot_id,
      issued_at_iso: now,
    },
    updated_at_iso: now,
  };
}

export function reschedule(
  b: BookingRecord,
  window: TimeWindow,
  notes?: string,
  clock: Clock = sysClock
): BookingRecord {
  if (b.status === "cancelled" || b.status === "complete") {
    throw new Error(`Cannot reschedule a ${b.status} booking.`);
  }
  validateWindow(window);
  const now = clock.now().toISOString();
  return {
    ...b,
    assignment: { ...b.assignment, window },
    notes: notes ?? b.notes,
    updated_at_iso: now,
  };
}

export function reassignResources(
  b: BookingRecord,
  resources: ResourceRef[],
  notes?: string,
  clock: Clock = sysClock
): BookingRecord {
  if (!resources?.length) throw new Error("resources must be non-empty");
  if (b.status === "cancelled" || b.status === "complete") {
    throw new Error(`Cannot reassign a ${b.status} booking.`);
  }
  const now = clock.now().toISOString();
  return {
    ...b,
    assignment: { ...b.assignment, resources },
    notes: notes ?? b.notes,
    updated_at_iso: now,
  };
}

export function cancel(
  b: BookingRecord,
  reason: string,
  clock: Clock = sysClock
): BookingRecord {
  if (b.status === "complete") throw new Error("Cannot cancel a completed booking.");
  const now = clock.now().toISOString();
  return {
    ...b,
    status: "cancelled",
    notes: [b.notes, `CANCELLED: ${reason}`].filter(Boolean).join(" • "),
    updated_at_iso: now,
  };
}

/* ============================== Helpers ============================== */

function detectTransportFlag(s: OrderStagingSnapshot): TransportFlag {
  // Mirror of order/staging detectTransportFlag to avoid cross import loops at runtime layers
  if (s.transport.in_quote) return "CDIQ";
  return s.transport.mode ? "CDC" : "CDN";
}

/* ============================== Example ============================== */
/*
import { lockFromBDO } from "../order/staging/contract";

const snapshot = lockFromBDO(bdoDraft, series);
const booking = createBooking({
  snapshot,
  window: { start_iso: "2025-11-10T08:00:00Z", end_iso: "2025-11-10T12:00:00Z" },
  resources: [{ kind: "vehicle", id: "TRK-12" }, { kind: "driver", id: "DRV-88" }],
  depot_id: "DPT-01",
}, series);

const confirmed = confirmBooking(booking, series);
*/