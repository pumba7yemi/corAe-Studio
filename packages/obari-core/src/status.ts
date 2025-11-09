/**
 * OBARI Core — Status Engine
 * Canonical verbs, statuses, and forward-only transition rules.
 * No external dependencies. Pure TypeScript.
 */

/* ──────────────────────────────────────────────────────────────────────────
   Verbs (fixed grammar)
────────────────────────────────────────────────────────────────────────── */
export const OBARI_VERBS = ["order", "booking", "active", "report", "invoice"] as const;
export type ObariVerb = typeof OBARI_VERBS[number];

/* ──────────────────────────────────────────────────────────────────────────
   Status enums (authoritative)
────────────────────────────────────────────────────────────────────────── */
export enum OrderStatus {
  Draft = "draft",
  Proposed = "proposed",
  Approved = "approved",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export enum BookingStatus {
  Tentative = "tentative",
  Scheduled = "scheduled",
  Rescheduled = "rescheduled",
  NoShow = "no_show",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum ActiveStatus {
  Queued = "queued",
  InProgress = "in_progress",
  OnHold = "on_hold",
  Done = "done",
  Failed = "failed",
}

export enum ReportStatus {
  Open = "open",
  Finalized = "finalized",
  Amended = "amended",
}

export enum InvoiceStatus {
  Draft = "draft",
  Issued = "issued",
  PartPaid = "part_paid",
  Paid = "paid",
  Overdue = "overdue",
  Cancelled = "cancelled",
}

/* ──────────────────────────────────────────────────────────────────────────
   Status unions by verb (handy for typing generic flows)
────────────────────────────────────────────────────────────────────────── */
export type StatusOf<V extends ObariVerb> =
  V extends "order" ? OrderStatus :
  V extends "booking" ? BookingStatus :
  V extends "active" ? ActiveStatus :
  V extends "report" ? ReportStatus :
  V extends "invoice" ? InvoiceStatus :
  never;

/* ──────────────────────────────────────────────────────────────────────────
   Forward transition maps (no implicit rollback)
   NOTE: Rollbacks must be explicit domain events handled elsewhere.
────────────────────────────────────────────────────────────────────────── */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Draft]:     [OrderStatus.Proposed, OrderStatus.Cancelled],
  [OrderStatus.Proposed]:  [OrderStatus.Approved, OrderStatus.Cancelled],
  [OrderStatus.Approved]:  [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [], // terminal for Order verb (handoff to Booking/Active)
  [OrderStatus.Cancelled]: [], // terminal
};

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.Tentative]:  [BookingStatus.Scheduled, BookingStatus.Cancelled],
  [BookingStatus.Scheduled]:  [BookingStatus.Rescheduled, BookingStatus.Completed, BookingStatus.NoShow, BookingStatus.Cancelled],
  [BookingStatus.Rescheduled]:[BookingStatus.Scheduled, BookingStatus.Cancelled],
  [BookingStatus.NoShow]:     [], // terminal outcome
  [BookingStatus.Completed]:  [], // terminal outcome
  [BookingStatus.Cancelled]:  [], // terminal outcome
};

const ACTIVE_TRANSITIONS: Record<ActiveStatus, ActiveStatus[]> = {
  [ActiveStatus.Queued]:     [ActiveStatus.InProgress, ActiveStatus.OnHold, ActiveStatus.Failed],
  [ActiveStatus.InProgress]: [ActiveStatus.OnHold, ActiveStatus.Done, ActiveStatus.Failed],
  [ActiveStatus.OnHold]:     [ActiveStatus.InProgress, ActiveStatus.Failed],
  [ActiveStatus.Done]:       [], // terminal
  [ActiveStatus.Failed]:     [], // terminal (escalations handled elsewhere)
};

const REPORT_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.Open]:      [ReportStatus.Finalized],
  [ReportStatus.Finalized]: [ReportStatus.Amended],
  [ReportStatus.Amended]:   [], // terminal
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.Draft]:     [InvoiceStatus.Issued, InvoiceStatus.Cancelled],
  [InvoiceStatus.Issued]:    [InvoiceStatus.PartPaid, InvoiceStatus.Paid, InvoiceStatus.Overdue, InvoiceStatus.Cancelled],
  [InvoiceStatus.PartPaid]:  [InvoiceStatus.Paid, InvoiceStatus.Overdue, InvoiceStatus.Cancelled],
  [InvoiceStatus.Paid]:      [], // terminal
  [InvoiceStatus.Overdue]:   [InvoiceStatus.PartPaid, InvoiceStatus.Paid, InvoiceStatus.Cancelled],
  [InvoiceStatus.Cancelled]: [], // terminal
};

/* ──────────────────────────────────────────────────────────────────────────
   Guards
────────────────────────────────────────────────────────────────────────── */
export function canTransition<V extends ObariVerb>(
  verb: V,
  from: StatusOf<V>,
  to: StatusOf<V>
): boolean {
  if (from === to) return false; // no-ops are not transitions
  switch (verb) {
    case "order":   return (ORDER_TRANSITIONS as any)[from]?.includes(to);
    case "booking": return (BOOKING_TRANSITIONS as any)[from]?.includes(to);
    case "active":  return (ACTIVE_TRANSITIONS as any)[from]?.includes(to);
    case "report":  return (REPORT_TRANSITIONS as any)[from]?.includes(to);
    case "invoice": return (INVOICE_TRANSITIONS as any)[from]?.includes(to);
    default:        return false;
  }
}

export function assertTransition<V extends ObariVerb>(
  verb: V,
  from: StatusOf<V>,
  to: StatusOf<V>
): void {
  if (!canTransition(verb, from, to)) {
    const msg = `[OBARI] Illegal transition for ${verb}: ${String(from)} → ${String(to)}. Forward-only; use explicit rollback events if needed.`;
    throw new Error(msg);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Introspection helpers (useful for UI/state machines)
────────────────────────────────────────────────────────────────────────── */
export function nextStatuses<V extends ObariVerb>(verb: V, from: StatusOf<V>): StatusOf<V>[] {
  switch (verb) {
    case "order":   return (ORDER_TRANSITIONS as any)[from] ?? [];
    case "booking": return (BOOKING_TRANSITIONS as any)[from] ?? [];
    case "active":  return (ACTIVE_TRANSITIONS as any)[from] ?? [];
    case "report":  return (REPORT_TRANSITIONS as any)[from] ?? [];
    case "invoice": return (INVOICE_TRANSITIONS as any)[from] ?? [];
    default:        return [];
  }
}