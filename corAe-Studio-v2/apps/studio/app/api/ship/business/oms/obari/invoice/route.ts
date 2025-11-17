// OBARI — Invoice API (Stage 6)
// - GET   : list all invoices or fetch one (?id=INV_*)
// - POST  : create from Report (REP_*) or from Active (ACT_*)
// - PATCH : update status / append notes / corrections (demo)
//
// In-memory only for demo.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------- Types -------------------------------- */

type Direction = "inbound" | "outbound";
type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export interface InvoiceLine {
  sku?: string;
  title: string;
  qty: number;
  unit_minor: number; // price in minor units (e.g. pence)
  uom?: string;
  note?: string;
}

export interface InvoiceRecord {
  invoice_id: string;
  source_report_id?: string;
  source_active_id?: string;

  direction: Direction;
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };

  currency: string; // "GBP"
  subtotal_minor: number;
  vat_rate: number; // 0.2 = 20%
  vat_minor: number;
  total_minor: number;

  status: InvoiceStatus;
  issued_at_iso: string;
  due_at_iso?: string;
  updated_at_iso: string;

  lines: InvoiceLine[];
  notes?: string;
}

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

/* ------------------------------ Repo (mem) ----------------------------- */

class MemoryInvoiceRepo {
  private map = new Map<string, InvoiceRecord>();

  async list(): Promise<InvoiceRecord[]> {
    return Array.from(this.map.values()).sort(
      (a, b) => a.issued_at_iso.localeCompare(b.issued_at_iso) * -1
    );
  }

  async get(id: string): Promise<InvoiceRecord | undefined> {
    return this.map.get(id);
  }

  async put(r: InvoiceRecord): Promise<void> {
    this.map.set(r.invoice_id, r);
  }

  async patch(id: string, patch: Partial<InvoiceRecord>): Promise<InvoiceRecord> {
    const cur = this.map.get(id);
    if (!cur) throw new Error("invoice not found");
    const next: InvoiceRecord = {
      ...cur,
      ...patch,
      updated_at_iso: nowISO(),
    };
    this.map.set(id, next);
    return next;
  }
}

const repo = new MemoryInvoiceRepo();

/* --------------------------- Factory helpers --------------------------- */

type ActiveLight = {
  active_id: string;
  direction: Direction;
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  totals: { subtotal: number; lines: number };
};

type ReportLight = {
  report_id: string;
  direction: Direction;
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  totals: { subtotal: number; lines: number };
};

function roundMinor(n: number) {
  return Math.round(n);
}

function buildInvoice(opts: {
  currency?: string;
  subtotal_minor: number;
  vat_rate?: number;
  seedLines?: InvoiceLine[];
  direction: Direction;
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  source_report_id?: string;
  source_active_id?: string;
}): InvoiceRecord {
  const vatRate = opts.vat_rate ?? 0.2;
  const vat = roundMinor(opts.subtotal_minor * vatRate);
  const total = roundMinor(opts.subtotal_minor + vat);

  const inv: InvoiceRecord = {
    invoice_id: id("INV"),
    source_report_id: opts.source_report_id,
    source_active_id: opts.source_active_id,

    direction: opts.direction,
    order_numbers: opts.order_numbers,
    parties: opts.parties,

    currency: opts.currency ?? "GBP",
    subtotal_minor: opts.subtotal_minor,
    vat_rate: vatRate,
    vat_minor: vat,
    total_minor: total,

    status: "issued",
    issued_at_iso: nowISO(),
    due_at_iso: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(), // +14 days
    updated_at_iso: nowISO(),

    lines: opts.seedLines?.length
      ? opts.seedLines
      : [
          {
            title: "Goods & Services",
            qty: 1,
            unit_minor: opts.subtotal_minor,
          },
        ],
    notes: "Auto-issued from previous stage.",
  };

  return inv;
}

/* --------------------------------- GET --------------------------------- */
// GET /api/ship/business/oms/obari/invoice
// GET /api/ship/business/oms/obari/invoice?id=INV_xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qid = searchParams.get("id");

  if (qid) {
    const item = await repo.get(qid);
    if (!item) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, invoice: item });
  }

  const items = await repo.list();
  return NextResponse.json({ ok: true, items });
}

/* --------------------------------- POST -------------------------------- */
// Body may be one of:
//  - { from_report: { report_id, direction, order_numbers, parties, totals, currency?, vat_rate? }, lines?: InvoiceLine[] }
//  - { from_active: { active_id, direction, order_numbers, parties, totals, currency?, vat_rate? }, lines?: InvoiceLine[] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let invoice: InvoiceRecord | null = null;

    if (body?.from_report?.report_id) {
      const r = body.from_report as ReportLight & { currency?: string; vat_rate?: number };
      invoice = buildInvoice({
        source_report_id: r.report_id,
        direction: r.direction,
        order_numbers: r.order_numbers,
        parties: r.parties,
        subtotal_minor: roundMinor(r.totals.subtotal),
        currency: body?.currency ?? r?.["currency"] ?? "GBP",
        vat_rate: body?.vat_rate ?? r?.["vat_rate"] ?? 0.2,
        seedLines: body?.lines as InvoiceLine[] | undefined,
      });
    } else if (body?.from_active?.active_id) {
      const a = body.from_active as ActiveLight & { currency?: string; vat_rate?: number };
      invoice = buildInvoice({
        source_active_id: a.active_id,
        direction: a.direction,
        order_numbers: a.order_numbers,
        parties: a.parties,
        subtotal_minor: roundMinor(a.totals.subtotal),
        currency: body?.currency ?? a?.["currency"] ?? "GBP",
        vat_rate: body?.vat_rate ?? a?.["vat_rate"] ?? 0.2,
        seedLines: body?.lines as InvoiceLine[] | undefined,
      });
    }

    if (!invoice) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload. Provide from_report or from_active." },
        { status: 400 }
      );
    }

    await repo.put(invoice);
    return NextResponse.json({ ok: true, invoice });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed to create invoice" }, { status: 400 });
  }
}

/* -------------------------------- PATCH -------------------------------- */
// Body: { id: "INV_xxx", status?: "draft"|"issued"|"paid"|"void", notes?: string, lines?: InvoiceLine[], vat_rate?: number }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const invId = String(body?.id || "");
    if (!invId) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    const current = await repo.get(invId);
    if (!current) {
      return NextResponse.json({ ok: false, error: "invoice not found" }, { status: 404 });
    }

    // If lines or vat_rate change, recompute totals
    let lines = body?.lines as InvoiceLine[] | undefined;
    let vat_rate: number | undefined = typeof body?.vat_rate === "number" ? body.vat_rate : undefined;

    let subtotal_minor = current.subtotal_minor;
    let vat_minor = current.vat_minor;
    let total_minor = current.total_minor;

    if (lines || typeof vat_rate === "number") {
      const newLines = lines ?? current.lines;
      const newSubtotal = newLines.reduce((acc, ln) => acc + Math.round(ln.qty * ln.unit_minor), 0);
      const newVatRate = typeof vat_rate === "number" ? vat_rate : current.vat_rate;
      const newVat = roundMinor(newSubtotal * newVatRate);
      const newTotal = roundMinor(newSubtotal + newVat);

      subtotal_minor = newSubtotal;
      vat_minor = newVat;
      total_minor = newTotal;
    }

    const patch = {
      status: body?.status as InvoiceStatus | undefined,
      notes: body?.notes as string | undefined,
      lines: lines ?? undefined,
      vat_rate: vat_rate ?? undefined,
      subtotal_minor,
      vat_minor,
      total_minor,
    };

    const updated = await repo.patch(invId, patch);
    return NextResponse.json({ ok: true, invoice: updated });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "failed to update invoice" }, { status: 400 });
  }
}