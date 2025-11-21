// OBARI API Singletons (dev/demo)
// Unified in-memory repo + number-series generators for local/demo builds.
// Safe defaults ensure UI pages never crash even if store is empty.
//
// Import examples:
//   import { repo, series } from "@/app/api/business/oms/obari/_singletons";

type AnySnap = {
  snapshot_id: string;
  order_no?: string;
  booking_id?: string;
  direction?: "inbound" | "outbound";
  when_iso?: string;
  status?: "booked" | "active" | "complete";
  order_numbers?: { po_no?: string; so_no?: string };
  created_at_iso?: string;
  [k: string]: any;
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Series generator â€” used to simulate order numbers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function makeSeries() {
  let po = 0;
  let so = 0;
  return {
    nextPurchase: () => `PO-${String(++po).padStart(4, "0")}`,
    nextSales: () => `SO-${String(++so).padStart(4, "0")}`,
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// In-memory repository (mock DB)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function makeRepo() {
  const store = new Map<string, AnySnap>();

  return {
    async save(snap: AnySnap) {
      const now = new Date().toISOString();
      const entry = {
        booking_id: snap.booking_id ?? snap.snapshot_id ?? crypto.randomUUID(),
        order_no: snap.order_no ?? series.nextSales(),
        direction: snap.direction ?? "inbound",
        when_iso: snap.when_iso ?? now,
        status: snap.status ?? "booked",
        ...snap,
      };
      store.set(entry.booking_id, entry);
      return entry;
    },

    async getById(id: string) {
      return store.get(id) ?? null;
    },

    async list() {
      return Array.from(store.values());
    },

    async clear() {
      store.clear();
    },
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Exports
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const series = makeSeries();
export const repo = makeRepo();
