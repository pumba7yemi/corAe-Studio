import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  BTDO,
  BDO,
  Order,
  Booking,
  Active,
  Report,
  Invoice,
  ID,
} from './model';
import { snapshotPriceLock, computeInvoice } from './pricelock';

const ROOT = path.join(process.cwd(), 'apps', 'studio', 'data', 'oms');

// Final layout:
//
// apps/studio/data/oms/
//   btdo/
//   bdo/
//   obari/
//     orders/
//     bookings/
//     active/
//     reports/
//     invoices/
const dirs = {
  btdo: path.join(ROOT, 'btdo'),
  bdo: path.join(ROOT, 'bdo'),
  orders: path.join(ROOT, 'obari', 'orders'),
  bookings: path.join(ROOT, 'obari', 'bookings'),
  active: path.join(ROOT, 'obari', 'active'),
  reports: path.join(ROOT, 'obari', 'reports'),
  invoices: path.join(ROOT, 'obari', 'invoices'),
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  await Promise.all(Object.values(dirs).map((d) => fs.mkdir(d, { recursive: true })));
}

function id(prefix: string): ID {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function writeJson(dir: string, obj: any) {
  const file = path.join(dir, `${obj.id}.json`);
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

async function readJson<T>(dir: string, id: ID): Promise<T | null> {
  try {
    const file = path.join(dir, `${id}.json`);
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function listJson<T>(dir: string): Promise<T[]> {
  try {
    const files = await fs.readdir(dir);
    const items: T[] = [];
    for (const f of files.filter((f) => f.endsWith('.json'))) {
      const raw = await fs.readFile(path.join(dir, f), 'utf8');
      items.push(JSON.parse(raw) as T);
    }
    return items.sort(
      (a: any, b: any) => (b.createdAt?.localeCompare?.(a.createdAt) ?? 0)
    );
  } catch {
    return [];
  }
}

/* ------------------- Create operations (copy-through) ------------------- */

export async function createBTDO(input: Omit<BTDO, 'id' | 'createdAt'>): Promise<BTDO> {
  await ensure();
  const obj: BTDO = { id: id('BTDO'), createdAt: new Date().toISOString(), ...input };
  await writeJson(dirs.btdo, obj);
  return obj;
}

export async function createBDO(input: {
  btdoId: ID;
  type: 'sales' | 'purchase';
  commodity?: string;
  route?: string;
  ownerNotes?: string;
}): Promise<BDO> {
  await ensure();
  const btdo = await readJson<BTDO>(dirs.btdo, input.btdoId);
  if (!btdo) throw new Error(`BTDO not found: ${input.btdoId}`);
  const obj: BDO = {
    id: id('BDO'),
    createdAt: new Date().toISOString(),
    btdoId: btdo.id,
    type: input.type,
    lock: snapshotPriceLock(btdo),
    commodity: input.commodity,
    route: input.route,
    ownerNotes: input.ownerNotes,
  };
  await writeJson(dirs.bdo, obj);
  return obj;
}

export async function createOrder(input: {
  bdoId: ID;
  direction: 'SO' | 'PO';
  quantity: number;
  requiredDate?: string;
  reference?: string;
  extReference?: string;
  notes?: string;
}): Promise<Order> {
  await ensure();
  const bdo = await readJson<BDO>(dirs.bdo, input.bdoId);
  if (!bdo) throw new Error(`BDO not found: ${input.bdoId}`);
  const obj: Order = {
    id: id('ORD'),
    createdAt: new Date().toISOString(),
    bdoId: bdo.id,
    direction: input.direction,
    lock: bdo.lock, // copy-through snapshot
    quantity: input.quantity,
    requiredDate: input.requiredDate,
    reference: input.reference,
    extReference: input.extReference,
    notes: input.notes,
  };
  await writeJson(dirs.orders, obj);
  return obj;
}

export async function createBooking(input: {
  orderId: ID;
  week: number;
  day: number;
  slot: string;
  eta?: string;
  notes?: string;
}): Promise<Booking> {
  await ensure();
  const ord = await readJson<Order>(dirs.orders, input.orderId);
  if (!ord) throw new Error(`Order not found: ${input.orderId}`);
  const obj: Booking = {
    id: id('BKG'),
    createdAt: new Date().toISOString(),
    orderId: ord.id,
    week: input.week,
    day: input.day,
    slot: input.slot,
    eta: input.eta,
    notes: input.notes,
  };
  await writeJson(dirs.bookings, obj);
  return obj;
}

export async function setActive(input: {
  orderId: ID;
  status: Active['status'];
  message?: string;
}): Promise<Active> {
  await ensure();
  const ord = await readJson<Order>(dirs.orders, input.orderId);
  if (!ord) throw new Error(`Order not found: ${input.orderId}`);
  const obj: Active = {
    id: id('ACT'),
    createdAt: new Date().toISOString(),
    orderId: ord.id,
    status: input.status,
    updatedAt: new Date().toISOString(),
    message: input.message,
  };
  await writeJson(dirs.active, obj);
  return obj;
}

export async function createReport(input: {
  orderId: ID;
  grvRef?: string;
  expiry?: string;
  adjustments?: { reason: string; amount: number }[];
  notes?: string;
}): Promise<Report> {
  await ensure();
  const ord = await readJson<Order>(dirs.orders, input.orderId);
  if (!ord) throw new Error(`Order not found: ${input.orderId}`);
  const obj: Report = {
    id: id('RPT'),
    createdAt: new Date().toISOString(),
    orderId: ord.id,
    grvRef: input.grvRef,
    expiry: input.expiry,
    adjustments: Array.isArray(input.adjustments) ? input.adjustments : [],
    notes: input.notes,
  };
  await writeJson(dirs.reports, obj);
  return obj;
}

export async function createInvoice(input: {
  orderId: ID;
  invoiceRef?: string;
}): Promise<Invoice> {
  await ensure();
  const ord = await readJson<Order>(dirs.orders, input.orderId);
  if (!ord) throw new Error(`Order not found: ${input.orderId}`);
  const rpt = (await listReports()).find((r) => r.orderId === ord.id) ?? null;
  const totals = computeInvoice(ord, rpt);
  const obj: Invoice = {
    id: id('INV'),
    createdAt: new Date().toISOString(),
    orderId: ord.id,
    invoiceRef: input.invoiceRef,
    currency: totals.currency,
    subtotal: totals.subtotal,
    adjustmentsTotal: totals.adjustmentsTotal,
    tax: totals.tax,
    total: totals.total,
  };
  await writeJson(dirs.invoices, obj);
  return obj;
}

/* ----------------------------- Queries ----------------------------- */

export const listBTDO = () => listJson<BTDO>(dirs.btdo);
export const listBDO = () => listJson<BDO>(dirs.bdo);
export const listOrders = () => listJson<Order>(dirs.orders);
export const listBookings = () => listJson<Booking>(dirs.bookings);
export const listActive = () => listJson<Active>(dirs.active);
export const listReports = () => listJson<Report>(dirs.reports);
export const listInvoices = () => listJson<Invoice>(dirs.invoices);
