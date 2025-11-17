// apps/ship/business/oms/obari/order/staging/contract.ts
// OBARI — Order Staging (Static Snapshot of a BDO)
// Purpose:
// - Treat Order as the immutable, static “staging post” created from a BDO.
// - Locks: parties, schedule, transport, lines, totals — all copied from BDO.
// - Assigns the commercial order number (PO for inbound / SO for outbound).
// - Downstream OBARI stages consume this snapshot: booking → active → report → invoice.
//
// Notes:
// - Money is minor units (pence/cents).
// - This module is side-effect free; persistence is the caller’s job.

export type Minor = number;
export type Direction = "inbound" | "outbound";

export type Cadence =
  | "WEEKLY"
  | "FORTNIGHTLY"
  | "EVERY_3_WEEKS"
  | "EVERY_4_WEEKS"
  | "MONTHLY"
  | "QUARTERLY"
  | "BIANNUAL"
  | "ANNUAL";

/* =============================== BDO =============================== */

export interface BdoLine {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: Minor;
  sector_hint?: "pallets" | "recyclables" | "machinery" | "consumables" | "service" | "other";
}

export interface BdoOrderDraft {
  bdo_id: string;
  direction: Direction; // inbound = PURCHASE, outbound = SALES
  counterparty: { id: string; name: string };
  our_party: { id: string; name: string };
  schedule:
    | { kind: "scheduled"; rule: Cadence; day?: string; window?: string }
    | { kind: "ad_hoc" };
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" };
  lines: BdoLine[];
  geography?: { country: string; region?: string; postcode?: string };
  references?: { quote_id?: string; product_ids?: string[]; client_po?: string };
  notes?: string;
}

/* =========================== Order Staging =========================== */

export interface OrderStagingLine {
  sku: string;
  title: string;
  qty: number;
  uom?: string;
  unit_price: Minor;
}

export interface OrderNumbers {
  po_no?: string; // set for inbound
  so_no?: string; // set for outbound
}

export interface OrderStagingSnapshot {
  snapshot_id: string;                 // immutable id for this staging snapshot
  source: { kind: "BDO"; id: string }; // lineage
  direction: Direction;                // inbound/outbound
  order_numbers: OrderNumbers;         // PO or SO (one side filled)
  parties: {
    counterparty_id: string;
    counterparty_name: string;
    our_id: string;
    our_name: string;
  };
  schedule: BdoOrderDraft["schedule"];
  transport: BdoOrderDraft["transport"];
  geography?: BdoOrderDraft["geography"];
  references?: BdoOrderDraft["references"];
  notes?: string;
  lines: OrderStagingLine[];
  totals: { subtotal: Minor; lines: number };
  status: "staging";                   // explicit staging post
  created_at_iso: string;              // when this snapshot was created
}

/* ============================== Utils ============================== */

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const pad = (n: number, w = 5) => String(n).padStart(w, "0");

function computeSubtotal(lines: { unit_price: Minor; qty: number }[]): Minor {
  return lines.reduce((acc, l) => acc + Math.round(l.unit_price * l.qty), 0);
}

export interface NumberSeries {
  nextPurchase?: () => number;
  nextSales?: () => number;
}

function assignNumbers(direction: Direction, series?: NumberSeries): OrderNumbers {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq =
    direction === "inbound"
      ? series?.nextPurchase
        ? pad(series.nextPurchase())
        : `TS${Date.now().toString().slice(-6)}`
      : series?.nextSales
        ? pad(series.nextSales())
        : `TS${Date.now().toString().slice(-6)}`;

  if (direction === "inbound") return { po_no: `PO-${y}${m}${d}-${seq}` };
  return { so_no: `SO-${y}${m}${d}-${seq}` };
}

export type TransportFlag = "CDIQ" | "CDC" | "CDN";
export function detectTransportFlag(transport: BdoOrderDraft["transport"]): TransportFlag {
  if (transport.in_quote) return "CDIQ";
  return transport.mode ? "CDC" : "CDN";
}

/* ========================= Core Constructor ========================= */
/**
 * lockFromBDO:
 * - Produces the immutable Order staging snapshot from a BDO.
 * - Copies all static fields (prep + schedule) so Order *has a reason to exist*:
 *   it is the committed, static state consumed by OBARI.
 * - Assigns commercial order number(s) immediately.
 */
export function lockFromBDO(
  bdo: BdoOrderDraft,
  series?: NumberSeries
): OrderStagingSnapshot {
  const numbers = assignNumbers(bdo.direction, series);
  const lines: OrderStagingLine[] = bdo.lines.map((ln) => ({
    sku: ln.sku,
    title: ln.title,
    qty: ln.qty,
    uom: ln.uom,
    unit_price: ln.unit_price,
  }));

  const snapshot: OrderStagingSnapshot = {
    snapshot_id: id("OSTG"),
    source: { kind: "BDO", id: bdo.bdo_id },
    direction: bdo.direction,
    order_numbers: numbers,
    parties: {
      counterparty_id: bdo.counterparty.id,
      counterparty_name: bdo.counterparty.name,
      our_id: bdo.our_party.id,
      our_name: bdo.our_party.name,
    },
    schedule: bdo.schedule,
    transport: bdo.transport,
    geography: bdo.geography,
    references: bdo.references,
    notes: bdo.notes,
    lines,
    totals: { subtotal: computeSubtotal(lines), lines: lines.length },
    status: "staging",
    created_at_iso: new Date().toISOString(),
  };

  return snapshot;
}

/* ======================= Guard: Static Snapshot ======================= */
/**
 * forbidMutation:
 * - Enforces the “static set of parameters” discipline.
 * - Allows only cosmetic notes changes while in staging.
 * - Any attempt to change locked fields is rejected.
 */
export type AllowedPatch = { notes?: string | null };

export function forbidMutation(
  prev: OrderStagingSnapshot,
  patch: Partial<OrderStagingSnapshot>
): { ok: true; next: OrderStagingSnapshot } | { ok: false; error: string } {
  const lockedKeys: (keyof OrderStagingSnapshot)[] = [
    "source",
    "direction",
    "order_numbers",
    "parties",
    "schedule",
    "transport",
    "geography",
    "references",
    "lines",
    "totals",
    "status",
    "created_at_iso",
  ];

  const attempted = Object.keys(patch) as (keyof OrderStagingSnapshot)[];
  const illegal = attempted.filter((k) => lockedKeys.includes(k));
  if (illegal.length) {
    return {
      ok: false,
      error: `Order staging is static; forbidden fields: ${illegal.join(", ")}`,
    };
  }

  // Only notes is allowed to change (cosmetic)
  const next: OrderStagingSnapshot = {
    ...prev,
    notes:
      (patch as AllowedPatch)?.notes === null
        ? undefined
        : (patch as AllowedPatch)?.notes ?? prev.notes,
  };
  return { ok: true, next };
}

/* ============================== Example ============================== */
/**
// Example wiring (caller side):

import {
  lockFromBDO,
  forbidMutation,
  detectTransportFlag,
  type BdoOrderDraft
} from "./contract";

const snapshot = lockFromBDO(bdoDraft, {
  nextPurchase: () => purchaseSeq.next(),
  nextSales: () => salesSeq.next(),
});

// persist(snapshot)
// const tflag = detectTransportFlag(snapshot.transport);

// later (only notes allowed)
const attempt = forbidMutation(snapshot, { notes: "Client asked morning window." });
if (!attempt.ok) throw new Error(attempt.error);
const updated = attempt.next;
// persist(updated)
*/