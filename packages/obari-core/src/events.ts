/**
 * OBARI Core — Domain Events (typed)
 * Canonical event names + payloads + minimal in-memory event bus.
 * No external dependencies. Pure TypeScript.
 */

import {
  OBARI_VERBS,
  type ObariVerb,
  type StatusOf,
  OrderStatus,
  BookingStatus,
  ActiveStatus,
  ReportStatus,
  InvoiceStatus,
} from "./status";

/* ──────────────────────────────────────────────────────────────────────────
   Event Names (authoritative)
   Grammar: <verb>.<action>  e.g., "order.created", "booking.scheduled"
   Keep the set minimal and composable. Rich details live in `meta`.
────────────────────────────────────────────────────────────────────────── */
export const EVENT_NAMES = {
  // ORDER
  ORDER_CREATED: "order.created",
  ORDER_STATUS_CHANGED: "order.status_changed",

  // BOOKING
  BOOKING_CREATED: "booking.created",
  BOOKING_STATUS_CHANGED: "booking.status_changed",

  // ACTIVE
  ACTIVE_CREATED: "active.created",
  ACTIVE_STATUS_CHANGED: "active.status_changed",

  // REPORT
  REPORT_CREATED: "report.created",
  REPORT_STATUS_CHANGED: "report.status_changed",

  // INVOICE
  INVOICE_CREATED: "invoice.created",
  INVOICE_STATUS_CHANGED: "invoice.status_changed",
} as const;

export type DomainEventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];

/* ──────────────────────────────────────────────────────────────────────────
   Common fields
────────────────────────────────────────────────────────────────────────── */
export type ULID = string; // placeholder; we’ll swap to a concrete ULID util later

export type BaseEvent = {
  /** Canonical event name */
  name: DomainEventName;
  /** ISO timestamp */
  at: string;
  /** Who triggered (user id, system, agent id, etc.) */
  by?: string;
  /** Org/tenant scoping (optional until schema lands) */
  orgId?: ULID;
  /** Location/site scoping (optional) */
  locationId?: ULID;
  /** Free-form metadata (never trust for logic; for observability only) */
  meta?: Record<string, unknown>;
};

/* ──────────────────────────────────────────────────────────────────────────
   Payloads by verb
────────────────────────────────────────────────────────────────────────── */
// ORDER
export type OrderCreated = BaseEvent & {
  name: "order.created";
  orderId: ULID;
  status: OrderStatus; // should be Draft or Proposed at creation time
};

export type OrderStatusChanged = BaseEvent & {
  name: "order.status_changed";
  orderId: ULID;
  from: OrderStatus;
  to: OrderStatus;
};

// BOOKING
export type BookingCreated = BaseEvent & {
  name: "booking.created";
  bookingId: ULID;
  /** Often linked to an order */
  orderId?: ULID;
  status: BookingStatus; // Tentative or Scheduled at creation
};

export type BookingStatusChanged = BaseEvent & {
  name: "booking.status_changed";
  bookingId: ULID;
  from: BookingStatus;
  to: BookingStatus;
};

// ACTIVE
export type ActiveCreated = BaseEvent & {
  name: "active.created";
  activityId: ULID;
  /** Links: from order/booking depending on flow */
  orderId?: ULID;
  bookingId?: ULID;
  status: ActiveStatus; // Queued/InProgress at creation
};

export type ActiveStatusChanged = BaseEvent & {
  name: "active.status_changed";
  activityId: ULID;
  from: ActiveStatus;
  to: ActiveStatus;
};

// REPORT
export type ReportCreated = BaseEvent & {
  name: "report.created";
  reportId: ULID;
  status: ReportStatus; // Open at creation
};

export type ReportStatusChanged = BaseEvent & {
  name: "report.status_changed";
  reportId: ULID;
  from: ReportStatus;
  to: ReportStatus;
};

// INVOICE
export type InvoiceCreated = BaseEvent & {
  name: "invoice.created";
  invoiceId: ULID;
  /** Can be linked to order, booking, or activity depending on origin */
  orderId?: ULID;
  bookingId?: ULID;
  activityId?: ULID;
  status: InvoiceStatus; // Draft at creation
};

export type InvoiceStatusChanged = BaseEvent & {
  name: "invoice.status_changed";
  invoiceId: ULID;
  from: InvoiceStatus;
  to: InvoiceStatus;
};

/* ──────────────────────────────────────────────────────────────────────────
   Event Map & Discriminated Union
────────────────────────────────────────────────────────────────────────── */
export type DomainEventMap = {
  // ORDER
  "order.created": OrderCreated;
  "order.status_changed": OrderStatusChanged;

  // BOOKING
  "booking.created": BookingCreated;
  "booking.status_changed": BookingStatusChanged;

  // ACTIVE
  "active.created": ActiveCreated;
  "active.status_changed": ActiveStatusChanged;

  // REPORT
  "report.created": ReportCreated;
  "report.status_changed": ReportStatusChanged;

  // INVOICE
  "invoice.created": InvoiceCreated;
  "invoice.status_changed": InvoiceStatusChanged;
};

export type DomainEventUnion = DomainEventMap[DomainEventName];

/* ──────────────────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────────────────── */
export function makeEvent<N extends DomainEventName>(
  name: N,
  payload: Omit<DomainEventMap[N], "name" | "at"> & Partial<Pick<BaseEvent, "at">>
): DomainEventMap[N] {
  const at = payload.at ?? new Date().toISOString();
  return { name, at, ...(payload as any) } as DomainEventMap[N];
}

export function isEvent<N extends DomainEventName>(
  e: DomainEventUnion,
  name: N
): e is DomainEventMap[N] {
  return e.name === name;
}

/**
 * Utility to type status-changed events for a given verb.
 * Example: makeStatusChanged("order", OrderStatus.Draft, OrderStatus.Proposed, { orderId })
 */
export function makeStatusChanged<V extends ObariVerb>(
  verb: V,
  from: StatusOf<V>,
  to: StatusOf<V>,
  ids:
    V extends "order"   ? { orderId: ULID }   :
    V extends "booking" ? { bookingId: ULID } :
    V extends "active"  ? { activityId: ULID }:
    V extends "report"  ? { reportId: ULID }  :
    V extends "invoice" ? { invoiceId: ULID } :
    never,
  base?: Omit<BaseEvent, "name"> 
): DomainEventUnion {
  const at = base?.at ?? new Date().toISOString();
  switch (verb) {
    case "order":
      return {
        name: "order.status_changed",
        at,
        ...(base ?? {}),
        ...(ids as any),
        from: from as OrderStatus,
        to: to as OrderStatus,
      } as OrderStatusChanged;
    case "booking":
      return {
        name: "booking.status_changed",
        at,
        ...(base ?? {}),
        ...(ids as any),
        from: from as BookingStatus,
        to: to as BookingStatus,
      } as BookingStatusChanged;
    case "active":
      return {
        name: "active.status_changed",
        at,
        ...(base ?? {}),
        ...(ids as any),
        from: from as ActiveStatus,
        to: to as ActiveStatus,
      } as ActiveStatusChanged;
    case "report":
      return {
        name: "report.status_changed",
        at,
        ...(base ?? {}),
        ...(ids as any),
        from: from as ReportStatus,
        to: to as ReportStatus,
      } as ReportStatusChanged;
    case "invoice":
      return {
        name: "invoice.status_changed",
        at,
        ...(base ?? {}),
        ...(ids as any),
        from: from as InvoiceStatus,
        to: to as InvoiceStatus,
      } as InvoiceStatusChanged;
    default:
      // Exhaustiveness
      throw new Error(`[OBARI] Unsupported verb for status change: ${String(verb)}`);
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Minimal In-Memory Event Bus (dev/runtime safe)
   - on/off/emit
   - typed subscriptions by event name
   - async handler support
────────────────────────────────────────────────────────────────────────── */
export type EventHandler<N extends DomainEventName> = (evt: DomainEventMap[N]) => void | Promise<void>;

export interface EventBus {
  on<N extends DomainEventName>(name: N, handler: EventHandler<N>): void;
  off<N extends DomainEventName>(name: N, handler: EventHandler<N>): void;
  emit<N extends DomainEventName>(evt: DomainEventMap[N]): Promise<void>;
  clear(): void;
}

export class InMemoryEventBus implements EventBus {
  private handlers: { [K in DomainEventName]?: Set<EventHandler<K>> } = {};

  on<N extends DomainEventName>(name: N, handler: EventHandler<N>): void {
    // new Set() is typed per-use to avoid complex mapped-type assignability issues
    (this.handlers[name] ??= new Set() as Set<EventHandler<any>>).add(handler as any);
  }

  off<N extends DomainEventName>(name: N, handler: EventHandler<N>): void {
    this.handlers[name]?.delete(handler as any);
  }

  async emit<N extends DomainEventName>(evt: DomainEventMap[N]): Promise<void> {
    const set = this.handlers[evt.name] as Set<EventHandler<N>> | undefined;
    if (!set || set.size === 0) return;
    for (const h of set) {
      await h(evt);
    }
  }

  clear(): void {
    (Object.keys(this.handlers) as DomainEventName[]).forEach((k) => this.handlers[k]?.clear());
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Example (dev note):
   const bus = new InMemoryEventBus();
   bus.on("order.status_changed", (e) => console.log(e.orderId, e.from, "→", e.to));
   await bus.emit(makeStatusChanged("order", OrderStatus.Draft, OrderStatus.Proposed, { orderId: "01H..." }));
────────────────────────────────────────────────────────────────────────── */