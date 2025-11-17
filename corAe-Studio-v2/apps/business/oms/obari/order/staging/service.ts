// apps/studio/apps/ship/app/business/oms/obari/order/staging/service.ts
// OBARI — Order Staging Service
// Implements the core service layer around contract.ts (lockFromBDO + guards).
// Used by API routes to create, update, and fetch immutable order snapshots.

import {
  lockFromBDO,
  forbidMutation,
  detectTransportFlag,
  type OrderStagingSnapshot,
  type NumberSeries,
  type BdoOrderDraft,
} from "./contract";

/* ---------------------------------------------------------------------- */
/* Repository Interfaces + In-Memory Dev Repo                             */
/* ---------------------------------------------------------------------- */

/**
 * Defines a repository interface for persisting Order Staging Snapshots.
 */
export interface StagingRepo {
  save(snap: OrderStagingSnapshot): Promise<void>;
  getById(id: string): Promise<OrderStagingSnapshot | null>;
  update(id: string, next: OrderStagingSnapshot): Promise<void>;
}

/**
 * Simple in-memory repository — used in dev/demo mode.
 */
export class MemoryStagingRepo implements StagingRepo {
  private store = new Map<string, OrderStagingSnapshot>();

  async save(snap: OrderStagingSnapshot): Promise<void> {
    this.store.set(snap.snapshot_id, snap);
  }

  async getById(id: string): Promise<OrderStagingSnapshot | null> {
    return this.store.get(id) ?? null;
  }

  async update(id: string, next: OrderStagingSnapshot): Promise<void> {
    if (!this.store.has(id)) throw new Error("Snapshot not found");
    this.store.set(id, next);
  }
}

/* ---------------------------------------------------------------------- */
/* Service Layer                                                          */
/* ---------------------------------------------------------------------- */

/**
 * stageFromBDO:
 * Converts a live BDO draft into a static, immutable Order Staging Snapshot.
 * Persists to repo and returns the snapshot.
 */
export async function stageFromBDO(
  bdo: BdoOrderDraft,
  deps: {
    series: NumberSeries;
    repo: StagingRepo;
    clock?: () => Date;
  }
): Promise<OrderStagingSnapshot> {
  if (!bdo || !bdo.bdo_id) throw new Error("Invalid BDO draft payload");
  if (!bdo.lines?.length) throw new Error("BDO must contain at least one line");

  const snapshot = lockFromBDO(bdo, deps.series);
  await deps.repo.save(snapshot);
  return snapshot;
}

/**
 * updateNotes:
 * Applies a safe notes-only patch using forbidMutation().
 * Returns the updated snapshot after persistence.
 */
export async function updateNotes(
  snapshotId: string,
  notes: string | null,
  deps: { series: NumberSeries; repo: StagingRepo }
): Promise<OrderStagingSnapshot> {
  const existing = await deps.repo.getById(snapshotId);
  if (!existing) throw new Error(`Snapshot ${snapshotId} not found`);

  const result = forbidMutation(existing, { notes: notes ?? undefined });
  if (!result.ok) throw new Error(result.error);

  await deps.repo.update(snapshotId, result.next);
  return result.next;
}

/**
 * getTransportFlag:
 * Returns the transport flag ("CDIQ" | "CDC" | "CDN") for a given snapshot.
 */
export async function getTransportFlag(
  snapshotId: string,
  deps: { series: NumberSeries; repo: StagingRepo }
): Promise<"CDIQ" | "CDC" | "CDN"> {
  const snap = await deps.repo.getById(snapshotId);
  if (!snap) throw new Error("Snapshot not found");
  return detectTransportFlag(snap.transport);
}