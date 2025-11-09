// data/oms/service.ts
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

// If you already have types in ./model, keep using them.
// Minimal shapes here so this file compiles even without model.ts.
export type ID = string;

export type Active = {
  id: ID;
  createdAt: string;
  orderId: ID;
  status: "pending" | "en-route" | "delivered" | "cancelled";
  updatedAt?: string;
  message?: string;
};

export type Booking = {
  id: ID;
  createdAt: string;
  orderId: ID;
  week: number;
  day: number;
  slot: string; // AM/PM or a window string
  eta?: string;
  notes?: string;
};

export type Invoice = {
  id: ID;
  createdAt: string;
  orderId: ID;
  invoiceRef?: string;
  currency: string;
  subtotal: number;
  adjustmentsTotal: number;
  tax: number;
  total: number;
};

// ---------- paths ----------

const ROOT = path.join(process.cwd(), "data", "oms");

const dirs = {
  // existing top-level OMS stores (keep whatever you already had)
  orders: path.join(ROOT, "orders"),
  bookings: path.join(ROOT, "bookings"),
  active: path.join(ROOT, "active"),
  reports: path.join(ROOT, "reports"),
  invoices: path.join(ROOT, "invoices"),

  // OBARI (separate, as requested)
  obari: {
    root: path.join(ROOT, "obari"),
    active: path.join(ROOT, "obari", "active"),
    booking: path.join(ROOT, "obari", "booking"),
    invoicing: path.join(ROOT, "obari", "invoicing"),
  },
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  await Promise.all([
    // core OMS (only if you use them)
    fs.mkdir(dirs.orders, { recursive: true }),
    fs.mkdir(dirs.bookings, { recursive: true }),
    fs.mkdir(dirs.active, { recursive: true }),
    fs.mkdir(dirs.reports, { recursive: true }),
    fs.mkdir(dirs.invoices, { recursive: true }),

    // OBARI
    fs.mkdir(dirs.obari.root, { recursive: true }),
    fs.mkdir(dirs.obari.active, { recursive: true }),
    fs.mkdir(dirs.obari.booking, { recursive: true }),
    fs.mkdir(dirs.obari.invoicing, { recursive: true }),
  ]);
}

function newId(prefix: string): ID {
  return `${prefix}-${crypto.randomUUID()}`;
}

async function writeJson(dir: string, obj: unknown & { id: ID }) {
  const file = path.join(dir, `${obj.id}.json`);
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(obj, null, 2), "utf8");
  await fs.rename(tmp, file);
}

async function listJson<T>(dir: string): Promise<T[]> {
  try {
    const names = await fs.readdir(dir);
    const out: T[] = [];
    for (const f of names) {
      if (!f.endsWith(".json")) continue;
      const raw = await fs.readFile(path.join(dir, f), "utf8");
      out.push(JSON.parse(raw) as T);
    }
    // newest first if objects have createdAt
    return out.sort((a: any, b: any) =>
      (b?.createdAt ?? "").localeCompare(a?.createdAt ?? "")
    );
  } catch {
    return [];
  }
}

// ------------------------------------------------------------------
// OBARI: separate create/list functions that write to obari/* folders
// ------------------------------------------------------------------

export async function obariCreateBooking(input: {
  orderId: ID;
  week: number;
  day: number;
  slot: string;
  eta?: string;
  notes?: string;
}): Promise<Booking> {
  await ensure();
  const obj: Booking = {
    id: newId("BKG"),
    createdAt: new Date().toISOString(),
    orderId: input.orderId,
    week: input.week,
    day: input.day,
    slot: input.slot,
    eta: input.eta,
    notes: input.notes,
  };
  await writeJson(dirs.obari.booking, obj);
  return obj;
}

export async function obariSetActive(input: {
  orderId: ID;
  status: Active["status"];
  message?: string;
}): Promise<Active> {
  await ensure();
  const obj: Active = {
    id: newId("ACT"),
    createdAt: new Date().toISOString(),
    orderId: input.orderId,
    status: input.status,
    updatedAt: new Date().toISOString(),
    message: input.message,
  };
  await writeJson(dirs.obari.active, obj);
  return obj;
}

export async function obariCreateInvoice(input: {
  orderId: ID;
  invoiceRef?: string;
  currency?: string;
  subtotal?: number;
  adjustmentsTotal?: number;
  tax?: number;
  total?: number;
}): Promise<Invoice> {
  await ensure();
  const obj: Invoice = {
    id: newId("INV"),
    createdAt: new Date().toISOString(),
    orderId: input.orderId,
    invoiceRef: input.invoiceRef,
    currency: input.currency ?? "AED",
    subtotal: input.subtotal ?? 0,
    adjustmentsTotal: input.adjustmentsTotal ?? 0,
    tax: input.tax ?? 0,
    total: input.total ?? 0,
  };
  await writeJson(dirs.obari.invoicing, obj);
  return obj;
}

export const listObariActive = () => listJson<Active>(dirs.obari.active);
export const listObariBooking = () => listJson<Booking>(dirs.obari.booking);
export const listObariInvoicing = () => listJson<Invoice>(dirs.obari.invoicing);

// (Optional) if you still also maintain the generic OMS lists:
export const listActive = () => listJson<Active>(dirs.active);
export const listBookings = () => listJson<Booking>(dirs.bookings);
export const listInvoices = () => listJson<Invoice>(dirs.invoices);