/**
 * corAe — Equals Boundary (=) Snapshot
 * Purpose: create a canonical, verifiable snapshot at BTDO → BDO handoff.
 * Downstream (Booking/Active/Report/Invoice) reads ONLY this snapshot.
 */

import { createHash } from "node:crypto";

export type EqualsInput = {
  dealId: string;             // single spine id
  stage: "BTDO" | "BDO";      // should be "BDO" at finalize
  status: "draft" | "proposed" | "approved" | "confirmed"; // at handoff
  number: string;             // human-friendly BDO code
  orgId?: string | null;
  locationId?: string | null;
  customerId?: string | null;
  vendorId?: string | null;
  currency: string;           // e.g., "AED"
  lines: Array<{
    sku?: string | null;
    itemName: string;
    qty: string | number;     // decimal-safe as string
    unitPrice: string | number;
    taxRate?: string | number; // percent (e.g., "5.00")
  }>;
  totals: {
    subtotal: string | number;
    taxTotal: string | number;
    total: string | number;
  };
  meta?: Record<string, unknown>;
};

/** Canonical JSON: deterministic key order + no extraneous whitespace */
export function canonicalize(obj: unknown): string {
  return JSON.stringify(sortKeysDeep(obj));
}

function sortKeysDeep(value: any): any {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value).sort()) out[k] = sortKeysDeep(value[k]);
    return out;
  }
  return value;
}

/** sha256 over canonical JSON */
export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

export type EqualsSnapshot = {
  dealId: string;
  at: string;                 // ISO timestamp
  stage: "BDO";               // finalized stage
  number: string;
  currency: string;
  payload: string;            // canonical JSON of the input (frozen)
  hash: string;               // sha256(payload)
  version: number;            // increment if structure changes
};

/**
 * Finalize BTDO -> BDO: produce the "=" snapshot
 * Rules:
 *  - stage must be "BDO"
 *  - status must be one of: proposed|approved|confirmed (not draft)
 *  - lines must exist and totals must be non-negative
 */
export function makeEqualsSnapshot(input: EqualsInput, now = new Date()): EqualsSnapshot {
  if (input.stage !== "BDO") {
    throw new Error("Equals finalize requires stage=BDO");
  }
  if (!["proposed", "approved", "confirmed"].includes(input.status)) {
    throw new Error("Equals finalize requires status ∈ {proposed, approved, confirmed}");
  }
  if (!input.lines || input.lines.length === 0) {
    throw new Error("Equals finalize requires at least one line");
  }
  const { subtotal, taxTotal, total } = input.totals;
  for (const n of [subtotal, taxTotal, total]) {
    const val = typeof n === "string" ? Number(n) : n;
    if (Number.isNaN(val) || val < 0) throw new Error("Totals must be valid, non-negative numbers");
  }

  const canonical = canonicalize({
    dealId: input.dealId,
    number: input.number,
    stage: input.stage,
    status: input.status,
    orgId: input.orgId ?? null,
    locationId: input.locationId ?? null,
    customerId: input.customerId ?? null,
    vendorId: input.vendorId ?? null,
    currency: input.currency,
    lines: input.lines.map(l => ({
      sku: l.sku ?? null,
      itemName: l.itemName,
      qty: String(l.qty),
      unitPrice: String(l.unitPrice),
      taxRate: l.taxRate == null ? "0" : String(l.taxRate),
    })),
    totals: {
      subtotal: String(subtotal),
      taxTotal: String(taxTotal),
      total: String(total),
    },
    meta: input.meta ?? {},
  });

  return {
    dealId: input.dealId,
    at: now.toISOString(),
    stage: "BDO",
    number: input.number,
    currency: input.currency,
    payload: canonical,
    hash: sha256(canonical),
    version: 1,
  };
}

/** Verify a stored "=" snapshot matches its payload */
export function verifyEqualsSnapshot(snap: EqualsSnapshot): boolean {
  return sha256(snap.payload) === snap.hash && snap.stage === "BDO" && snap.version >= 1;
}