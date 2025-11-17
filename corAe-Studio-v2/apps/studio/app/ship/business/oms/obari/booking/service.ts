// apps/studio/apps/ship/app/business/oms/obari/booking/service.ts
// OBARI — Booking Service (domain orchestration + repo)
// Works with immutable Order Staging snapshots to manage bookings.
// Pure domain + in-memory repo (swap for DB in prod).

import type {
  OrderStagingSnapshot,
} from "../order/staging/contract";
import {
  createBooking,
  confirmBooking,
  reschedule,
  reassignResources,
  cancel,
  type BookingRecord,
  type CreateBookingInput,
  type TimeWindow,
  type ResourceRef,
  type Sequence,
} from "./contract";

/* ============================== Repo Port ============================== */

export interface BookingRepo {
  save(b: BookingRecord): Promise<void>;
  getById(id: string): Promise<BookingRecord | null>;
  listBySnapshot(snapshotId: string): Promise<BookingRecord[]>;
  update(b: BookingRecord): Promise<void>;
}

/* ============================ In-Memory Repo =========================== */
/** Dev/demo only; replace with DB implementation. */
export class MemoryBookingRepo implements BookingRepo {
  private store = new Map<string, BookingRecord>();
  async save(b: BookingRecord): Promise<void> {
    this.store.set(b.booking_id, b);
  }
  async getById(id: string): Promise<BookingRecord | null> {
    return this.store.get(id) ?? null;
  }
  async listBySnapshot(snapshotId: string): Promise<BookingRecord[]> {
    return [...this.store.values()].filter((x) => x.from_snapshot.snapshot_id === snapshotId);
  }
  async update(b: BookingRecord): Promise<void> {
    if (!this.store.has(b.booking_id)) throw new Error("booking not found");
    this.store.set(b.booking_id, b);
  }
}

/* ============================== Sequences ============================== */

export class MemorySequence implements Sequence {
  private n = 0;
  nextBookingNumber() {
    this.n += 1;
    return this.n;
  }
}

/* ============================= Service API ============================= */

export interface BookingDeps {
  repo: BookingRepo;
  seq: Sequence;
  // optional hook to validate resource capacity, depot windows, etc.
  capacityGuard?: (assignment: {
    snapshot: OrderStagingSnapshot;
    window: TimeWindow;
    resources: ResourceRef[];
    depot_id?: string;
  }) => Promise<{ ok: true } | { ok: false; reason: string }>;
}

export async function planBooking(
  input: CreateBookingInput,
  deps: BookingDeps
): Promise<BookingRecord> {
  if (deps.capacityGuard) {
    const gate = await deps.capacityGuard({
      snapshot: input.snapshot,
      window: input.window,
      resources: input.resources,
      depot_id: input.depot_id,
    });
    if (!gate.ok) throw new Error(`capacity denied: ${gate.reason}`);
  }

  const rec = createBooking(input, deps.seq);
  await deps.repo.save(rec);
  return rec;
}

export async function confirmPlanned(
  bookingId: string,
  deps: BookingDeps
): Promise<BookingRecord> {
  const cur = await mustGet(bookingId, deps.repo);
  const nxt = confirmBooking(cur, deps.seq);
  await deps.repo.update(nxt);
  return nxt;
}

export async function moveWindow(
  bookingId: string,
  window: TimeWindow,
  deps: BookingDeps,
  notes?: string
): Promise<BookingRecord> {
  const cur = await mustGet(bookingId, deps.repo);
  const nxt = reschedule(cur, window, notes);
  await deps.repo.update(nxt);
  return nxt;
}

export async function changeResources(
  bookingId: string,
  resources: ResourceRef[],
  deps: BookingDeps,
  notes?: string
): Promise<BookingRecord> {
  const cur = await mustGet(bookingId, deps.repo);
  const nxt = reassignResources(cur, resources, notes);
  await deps.repo.update(nxt);
  return nxt;
}

export async function cancelBooking(
  bookingId: string,
  reason: string,
  deps: BookingDeps
): Promise<BookingRecord> {
  const cur = await mustGet(bookingId, deps.repo);
  const nxt = cancel(cur, reason);
  await deps.repo.update(nxt);
  return nxt;
}

export async function getBooking(
  bookingId: string,
  deps: BookingDeps
): Promise<BookingRecord> {
  return await mustGet(bookingId, deps.repo);
}

export async function listForSnapshot(
  snapshotId: string,
  deps: BookingDeps
): Promise<BookingRecord[]> {
  return deps.repo.listBySnapshot(snapshotId);
}

/* ============================== Internals ============================= */

async function mustGet(id: string, repo: BookingRepo): Promise<BookingRecord> {
  const found = await repo.getById(id);
  if (!found) throw new Error("booking not found");
  return found;
}

/* ============================== Example ============================== */
/*
import { MemoryBookingRepo, MemorySequence, planBooking, confirmPlanned } from "./service";
import { lockFromBDO } from "../order/staging/contract";
import { bdoDraft } from "../../__fixtures__/bdo";

const snapshot = lockFromBDO(bdoDraft);
const repo = new MemoryBookingRepo();
const seq  = new MemorySequence();

const planned = await planBooking({
  snapshot,
  window: { start_iso: "2025-11-10T08:00:00Z", end_iso: "2025-11-10T12:00:00Z" },
  resources: [{ kind: "vehicle", id: "TRK-12" }, { kind: "driver", id: "DRV-88" }],
}, { repo, seq });

const confirmed = await confirmPlanned(planned.booking_id, { repo, seq });
*/