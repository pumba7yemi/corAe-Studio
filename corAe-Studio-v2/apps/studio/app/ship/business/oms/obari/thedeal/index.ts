// apps/ship/business/oms/obari/thedeal/index.ts
// OBARI · TheDeal (BDO) — Constitutional Stage Manifest & Guards
// Canonical stage order (root): Prep → Schedule → OrderBooking → Active → Report → Invoice
// Use this as the single source of truth for stage sequencing & transition guards.

export type Stage =
  | "PREP"           // commercial prep (SO/PO intent, item+party, transport hint)
  | "SCHEDULE"       // cadence + date window selection (CYCLE_28 / MONTHLY / HYBRID)
  | "ORDER_BOOKING"  // email booking + docs dispatch (RAMS/WTN/etc), slot reservation
  | "ACTIVE"         // execution window (collection/delivery/job/rental/service)
  | "REPORT"         // vendor/customer reports → client reports (approved)
  | "INVOICE";       // financial documents (SO/PO → AR/AP)

export const STAGE_ORDER: readonly Stage[] = Object.freeze([
  "PREP",
  "SCHEDULE",
  "ORDER_BOOKING",
  "ACTIVE",
  "REPORT",
  "INVOICE",
]);

// Human labels for UI breadcrumbs and audit trails
export const STAGE_LABEL: Record<Stage, string> = {
  PREP: "Prep",
  SCHEDULE: "Schedule",
  ORDER_BOOKING: "Order Booking",
  ACTIVE: "Active",
  REPORT: "Report",
  INVOICE: "Invoice",
};

// Narrow helper: return the next stage or null if terminal
export function nextStage(s: Stage): Stage | null {
  const i = STAGE_ORDER.indexOf(s);
  if (i < 0 || i === STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[i + 1];
}

// Guard: is forward transition lawful?
export function canTransition(from: Stage, to: Stage): boolean {
  const fi = STAGE_ORDER.indexOf(from);
  const ti = STAGE_ORDER.indexOf(to);
  return fi >= 0 && ti >= 0 && ti === fi + 1;
}

// Guard with reason (useful for API responses)
export function assertTransition(from: Stage, to: Stage): { ok: true } | { ok: false; error: string } {
  if (from === to) return { ok: false, error: `No-op transition: already at ${to}` };
  if (!canTransition(from, to)) {
    return { ok: false, error: `Illegal transition ${from} → ${to}. Expected ${nextStage(from) ?? "end"}.` };
  }
  return { ok: true };
}

// Canonical paths for each stage namespace (kept here to avoid drift)
export const THEDEAL_PATH = {
  PREP:       "apps/ship/business/oms/obari/thedeal/prep",
  SCHEDULE:   "apps/ship/business/oms/obari/thedeal/schedule",
  BOOKING:    "apps/ship/business/oms/obari/thedeal/booking", // folder name is 'booking' while stage is ORDER_BOOKING
  ACTIVE:     "apps/ship/business/oms/obari/thedeal/active",
  REPORT:     "apps/ship/business/oms/obari/thedeal/report",
  INVOICE:    "apps/ship/business/oms/obari/thedeal/invoice",
} as const;

// Simple stage breadcrumb for UIs
export function breadcrumb(current: Stage): { key: Stage; label: string; active: boolean; done: boolean }[] {
  const idx = STAGE_ORDER.indexOf(current);
  return STAGE_ORDER.map((k, i) => ({
    key: k,
    label: STAGE_LABEL[k],
    active: i === idx,
    done: i < idx,
  }));
}

// Minimal BDO header (shared across stage payloads)
export interface BdoHeader {
  bdo_id: string;
  client_id: string;     // “our” client party (for outbound) or service client (for inbound execution context)
  site_id: string;       // operational site (CDJRS place-of-business)
  direction: "outbound" | "inbound"; // SALES vs PURCHASE at the constitutional layer
  created_iso: string;
  stage: Stage;
}

// State envelope carried across the pipeline (opaque “data” by stage)
export interface BdoEnvelope<T = unknown> extends BdoHeader {
  data: T;             // stage-specific payload (e.g., prep draft, schedule snapshot, booking email meta, etc.)
  lineage: string[];   // hash/ids of prior confirmations (PriceLock chain compatibility)
}

// Forward-only reducer (stage machine). You pass the next payload and it enforces sequencing.
export function advance<TNext>(
  current: BdoEnvelope<any>,
  nextStageKey: Stage,
  nextData: TNext,
  lineageAdd?: string
): BdoEnvelope<TNext> {
  const guard = assertTransition(current.stage, nextStageKey);
  if (!guard.ok) throw new Error(guard.error);

  return {
    ...current,
    stage: nextStageKey,
    data: nextData,
    lineage: lineageAdd ? [...current.lineage, lineageAdd] : current.lineage,
  };
}

// Factory to start a BDO envelope in PREP
export function startBdo(init: Omit<BdoHeader, "created_iso" | "stage">, prepData: unknown): BdoEnvelope {
  return {
    ...init,
    created_iso: new Date().toISOString(),
    stage: "PREP",
    data: prepData,
    lineage: [],
  };
}

// —— Export convenience re-exports (each sub-stage should expose its own API under these files)
// export * as PrepAPI from "./prep";
// export * as ScheduleAPI from "./schedule";
// export * as BookingAPI from "./booking";
// export * as ActiveAPI from "./active";
// export * as ReportAPI from "./report";
// export * as InvoiceAPI from "./invoice";