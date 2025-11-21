// apps/studio/lib/agent/obariStore.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.join(process.cwd(), 'var', 'obari');

const FILES = {
  orders:   path.join(ROOT, 'orders.json'),
  bookings: path.join(ROOT, 'bookings.json'),
  active:   path.join(ROOT, 'active.json'),
  report:   path.join(ROOT, 'report.json'),   // <-- renamed from reconcile.json
  invoices: path.join(ROOT, 'invoices.json'),
};

type Item = Record<string, any>;

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

async function readJSON<T = any>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(file: string, data: any): Promise<void> {
  await ensureDir(path.dirname(file));
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

export async function ensureStores() {
  await ensureDir(ROOT);
  for (const f of Object.values(FILES)) {
    try { await fs.access(f); }
    catch { await writeJSON(f, []); }
  }
}

// --- list helpers ---
export const listOrders  = () => readJSON<Item[]>(FILES.orders, []);
export const listBookings = () => readJSON<Item[]>(FILES.bookings, []);
export const listActive  = () => readJSON<Item[]>(FILES.active, []);
export const listReport  = () => readJSON<Item[]>(FILES.report, []); // <-- new name
export const listInvoices = () => readJSON<Item[]>(FILES.invoices, []);

// --- core mutations ---
export async function createOrder(input: {
  vendor: string;
  items: Array<{ sku?: string; name?: string; qty?: number; price?: number }>;
  dealId?: string;
  notes?: string;
}) {
  const orders = await listOrders();
  const order = {
    id: crypto.randomUUID(),
    status: 'order',
    vendor: input.vendor,
    items: input.items || [],
    dealId: input.dealId || null,
    notes: input.notes || null,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await writeJSON(FILES.orders, orders);
  return order;
}

export async function bookOrder(input: {
  orderId: string;
  week: number; // 1..4 for 28-day cycle
  day: number;  // 1..7
  slot: string; // AM/PM or a named slot
}) {
  const orders = await listOrders();
  const order = orders.find(o => o.id === input.orderId);
  if (!order) throw new Error(`Order not found: ${input.orderId}`);

  const bookings = await listBookings();
  const booking = {
    id: crypto.randomUUID(),
    orderId: order.id,
    week: input.week,
    day: input.day,
    slot: input.slot,
    status: 'booked',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  await writeJSON(FILES.bookings, bookings);
  return booking;
}

export async function markActive(input: { orderId: string; eta?: string }) {
  const orders = await listOrders();
  const order = orders.find(o => o.id === input.orderId);
  if (!order) throw new Error(`Order not found: ${input.orderId}`);

  const active = await listActive();
  const a = {
    id: crypto.randomUUID(),
    orderId: order.id,
    eta: input.eta || null,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  active.push(a);
  await writeJSON(FILES.active, active);
  return a;
}

/**
 * reportOrder = the post-delivery reporting step (was "reconcile"):
 *  - GRV ref, expiry details, adjustments, quality notes, etc.
 */
export async function reportOrder(input: {
  orderId: string;
  grvRef: string;
  expiry?: string;
  adjustments?: Array<{ reason: string; amount: number }>;
  notes?: string;
}) {
  const orders = await listOrders();
  const order = orders.find(o => o.id === input.orderId);
  if (!order) throw new Error(`Order not found: ${input.orderId}`);

  const reports = await listReport();
  const rec = {
    id: crypto.randomUUID(),
    orderId: order.id,
    grvRef: input.grvRef,
    expiry: input.expiry || null,
    adjustments: Array.isArray(input.adjustments) ? input.adjustments : [],
    notes: input.notes || null,
    status: 'report',
    createdAt: new Date().toISOString(),
  };
  reports.push(rec);
  await writeJSON(FILES.report, reports);
  return rec;
}

export async function finalInvoice(input: {
  orderId: string;
  invoiceRef: string;
  total: number;
  currency: string;
}) {
  const orders = await listOrders();
  const order = orders.find(o => o.id === input.orderId);
  if (!order) throw new Error(`Order not found: ${input.orderId}`);

  const invoices = await listInvoices();
  const inv = {
    id: crypto.randomUUID(),
    orderId: order.id,
    invoiceRef: input.invoiceRef,
    total: input.total,
    currency: input.currency,
    status: 'invoiced',
    createdAt: new Date().toISOString(),
  };
  invoices.push(inv);
  await writeJSON(FILES.invoices, invoices);
  return inv;
}
