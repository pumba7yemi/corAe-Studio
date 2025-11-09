// C:\corae\corAe-Studio\src\components\obari\store.ts
// OBARI — Minimal in-memory Orders store to satisfy `@/obari/store` imports
// No external imports. Server/Client safe. Can be swapped with Prisma later.

/* ---------- Types (aligned with your UI) ---------- */
export type Direction = "PURCHASE" | "SALES";
export type WeekRef = "W1" | "W2" | "W3" | "W4";
export type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

export type Order = {
  id: string;
  code: string;
  direction: Direction;
  expectedWeek: WeekRef | null;
  scheduleMode: ScheduleMode;
  itemCode: string | null;
  description: string | null;
  qty: string;        // Decimal as string
  unit: string | null;
  unitPrice: string;  // Decimal as string
  currency: string;
  vendorCode: string | null;
  customerCode: string | null;
  createdAt: string;  // ISO
};

/* ---------- Internal store (SSR-safe) ---------- */
const mem: { orders: Order[] } = {
  orders: seedOrders(),
};

function seedOrders(): Order[] {
  const now = new Date();
  const a: Order = {
    id: cuid(),
    code: makeOrderCode("SALES", "SKU-PEPSI-500"),
    direction: "SALES",
    expectedWeek: "W2",
    scheduleMode: "CYCLE_28",
    itemCode: "SKU-PEPSI-500",
    description: "PEPSI 500ml (case)",
    qty: "120",
    unit: "EA",
    unitPrice: "3.50",
    currency: "AED",
    vendorCode: null,
    customerCode: "Customer0001",
    createdAt: now.toISOString(),
  };
  const b: Order = {
    id: cuid(),
    code: makeOrderCode("PURCHASE", "SKU-WASTE-240L"),
    direction: "PURCHASE",
    expectedWeek: "W3",
    scheduleMode: "CYCLE_28",
    itemCode: "SKU-WASTE-240L",
    description: "Waste bin service 240L",
    qty: "10",
    unit: "EA",
    unitPrice: "25.00",
    currency: "AED",
    vendorCode: "Vendor0001",
    customerCode: null,
    createdAt: new Date(now.getTime() - 86400000).toISOString(),
  };
  return [a, b];
}

/* ---------- Utilities ---------- */
function cuid(): string {
  // simple cuid-like
  return "c" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function makeOrderCode(dir: Direction, sku: string | null): string {
  const y = new Date().getFullYear().toString().slice(-2);
  const m = String(new Date().getMonth() + 1).padStart(2, "0");
  const d = String(new Date().getDate()).padStart(2, "0");
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  const base = sku ? sku.replace(/[^A-Z0-9]+/gi, "").toUpperCase().slice(0, 8) : "ITEM";
  return `${dir === "PURCHASE" ? "PO" : "SO"}-${base}-${y}${m}${d}-${tail}`;
}

/* ---------- Public API ---------- */

export async function listOrders(params?: {
  q?: string;
  direction?: Direction | "";
  limit?: number;
}): Promise<Order[]> {
  const { q = "", direction = "", limit = 50 } = params ?? {};
  const qq = q.trim().toLowerCase();
  const filtered = mem.orders.filter((o) => {
    const okDir = direction ? o.direction === direction : true;
    const okQ =
      !qq ||
      o.code.toLowerCase().includes(qq) ||
      (o.itemCode ?? "").toLowerCase().includes(qq) ||
      (o.vendorCode ?? "").toLowerCase().includes(qq) ||
      (o.customerCode ?? "").toLowerCase().includes(qq);
    return okDir && okQ;
  });
  return filtered.slice(0, Math.max(1, limit));
}

export async function getOrderById(id: string): Promise<Order | null> {
  return mem.orders.find((o) => o.id === id) ?? null;
}

export async function createOrder(input: {
  direction: Direction;
  itemCode: string;
  description?: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  currency?: string;
  scheduleMode: ScheduleMode;
  expectedWeek?: WeekRef | null;
  vendorCode?: string;
  customerCode?: string;
}): Promise<Order> {
  const ord: Order = {
    id: cuid(),
    code: makeOrderCode(input.direction, input.itemCode),
    direction: input.direction,
    expectedWeek: input.expectedWeek ?? null,
    scheduleMode: input.scheduleMode,
    itemCode: input.itemCode || null,
    description: input.description?.trim() || null,
    qty: String(input.qty),
    unit: input.unit?.trim() || null,
    unitPrice: String(input.unitPrice),
    currency: input.currency?.trim() || "AED",
    vendorCode: input.direction === "PURCHASE" ? (input.vendorCode?.trim() || "Vendor0001") : null,
    customerCode: input.direction === "SALES" ? (input.customerCode?.trim() || "Customer0001") : null,
    createdAt: new Date().toISOString(),
  };
  mem.orders.unshift(ord);
  return ord;
}

export async function updateOrderPartial(id: string, patch: Partial<Order>): Promise<Order | null> {
  const idx = mem.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  mem.orders[idx] = { ...mem.orders[idx], ...patch };
  return mem.orders[idx];
}