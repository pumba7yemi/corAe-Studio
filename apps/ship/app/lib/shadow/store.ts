// apps/ship/app/lib/shadow/store.ts
// Shadow Mirror: ephemeral, in-memory event store for "run-as-you-are" mirroring.
// NOTE: This is volatile (per server process). No DB writes, safe for Demo/Trials.

export type ShadowEventBase = {
  id: string;                 // caller-provided or generated upstream
  type:
    | "order.created"
    | "order.paid"
    | "inventory.adjusted"
    | "product.updated"
    | "staff.clock"
    | "booking.created"
    | "payment.captured"
    | "refund.issued"
    | "customer.updated"
    | "meta.note";
  occurredAt: string;         // ISO timestamp from source system
  receivedAt: string;         // ISO timestamp when we ingested (set by API)
  source: string;             // e.g. "pos.vend", "shopify", "toast", "custom"
  payload: Record<string, unknown>; // minimally structured pass-through
};

export type ShadowCompanySnapshot = {
  companyId: string;
  totals: {
    events: number;
    byType: Record<string, number>;
    firstEventAt?: string;
    lastEventAt?: string;
  };
  // Tail samples for quick UI previews (last N per key types)
  tails: {
    orders: ShadowEventBase[];        // order.created/order.paid
    inventory: ShadowEventBase[];     // inventory.adjusted/product.updated
    staff: ShadowEventBase[];         // staff.clock
    bookings: ShadowEventBase[];      // booking.created
    payments: ShadowEventBase[];      // payment.captured/refund.issued
    customers: ShadowEventBase[];     // customer.updated
    notes: ShadowEventBase[];         // meta.note
  };
  updatedAt?: string;
};

type ShadowBucket = {
  events: ShadowEventBase[];
  byType: Record<string, number>;
  firstEventAt?: string;
  lastEventAt?: string;
  updatedAt?: string;
};

type ShadowStore = {
  companies: Record<string, ShadowBucket>;
  maxEventsPerCompany: number; // hard cap safeguard
  tailSize: number;            // how many per category to surface in snapshot
};

// ───────────────────────────────────────────────────────────────
// Global singleton (safe across hot reloads in dev)
// ───────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __CORAE_SHIP_SHADOW_STORE__: ShadowStore | undefined;
}

function makeStore(): ShadowStore {
  return {
    companies: {},
    maxEventsPerCompany: 50_000, // adjustable guardrail
    tailSize: 25,                // UI-friendly tails
  };
}

const STORE: ShadowStore = (globalThis.__CORAE_SHIP_SHADOW_STORE__ ??= makeStore());

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────
function getBucket(companyId: string): ShadowBucket {
  const existing = STORE.companies[companyId];
  if (existing) return existing;
  const bucket: ShadowBucket = {
    events: [],
    byType: {},
  };
  STORE.companies[companyId] = bucket;
  return bucket;
}

export function listCompanies(): string[] {
  return Object.keys(STORE.companies);
}

export function setTailSize(n: number) {
  STORE.tailSize = Math.max(1, Math.min(200, n));
}

export function setMaxEventsPerCompany(n: number) {
  STORE.maxEventsPerCompany = Math.max(1_000, Math.min(5_000_000, n));
}

// Append a new event (already validated by API layer)
export function appendEvent(companyId: string, e: ShadowEventBase): { ok: true; count: number } {
  const bucket = getBucket(companyId);

  // Enforce max size by trimming oldest (simple ring-buffer behavior)
  if (bucket.events.length >= STORE.maxEventsPerCompany) {
    const drop = Math.ceil(STORE.maxEventsPerCompany * 0.1); // drop 10% oldest
    bucket.events.splice(0, drop);
    // rebuild byType after drop (cheap enough at this size)
    bucket.byType = {};
    for (const evt of bucket.events) {
      bucket.byType[evt.type] = (bucket.byType[evt.type] ?? 0) + 1;
    }
  }

  bucket.events.push(e);
  bucket.byType[e.type] = (bucket.byType[e.type] ?? 0) + 1;

  const firstAt = bucket.firstEventAt ?? e.receivedAt ?? e.occurredAt;
  bucket.firstEventAt = firstAt;
  bucket.lastEventAt = e.receivedAt ?? e.occurredAt;
  bucket.updatedAt = new Date().toISOString();

  return { ok: true, count: bucket.events.length };
}

export function clearCompany(companyId: string) {
  delete STORE.companies[companyId];
}

export function clearAll() {
  STORE.companies = {};
}

export function getSnapshot(companyId: string): ShadowCompanySnapshot {
  const bucket = getBucket(companyId);
  const tail = (types: string[]): ShadowEventBase[] => {
    const filtered = bucket.events.filter((e) => types.includes(e.type));
    return filtered.slice(-STORE.tailSize);
  };

  return {
    companyId,
    totals: {
      events: bucket.events.length,
      byType: { ...bucket.byType },
      firstEventAt: bucket.firstEventAt,
      lastEventAt: bucket.lastEventAt,
    },
    tails: {
      orders: tail(["order.created", "order.paid"]),
      inventory: tail(["inventory.adjusted", "product.updated"]),
      staff: tail(["staff.clock"]),
      bookings: tail(["booking.created"]),
      payments: tail(["payment.captured", "refund.issued"]),
      customers: tail(["customer.updated"]),
      notes: tail(["meta.note"]),
    },
    updatedAt: bucket.updatedAt,
  };
}

// Monkey steps

// 1. Create folders: apps/ship/app/lib/shadow/


// 2. Create file store.ts in that folder.


// 3. Paste the code above and save.

