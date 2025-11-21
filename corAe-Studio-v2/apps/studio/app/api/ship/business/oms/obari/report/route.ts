// apps/studio/app/api/business/oms/obari/report/route.ts
// OBARI â€” Report API (Stage 5)
// - POST  : generate report from Active record (ACT_*)
// - GET   : list or fetch reports (?id=REP_*)
// - PATCH : append corrections/notes (demo)
//
// In-memory only for demonstration.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ------------------------------- Types -------------------------------- */

export interface ReportRecord {
  report_id: string;
  source_active_id: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  status: "draft" | "final";
  variance?: { reason?: string; delta_minor?: number };
  compliance?: { ok: boolean; missing?: string[] };
  totals: { subtotal: number; lines: number };
  generated_at_iso: string;
  updated_at_iso: string;
  notes?: string;
}

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

/* ------------------------------ Repo (mem) ----------------------------- */

class MemoryReportRepo {
  private map = new Map<string, ReportRecord>();

  async list(): Promise<ReportRecord[]> {
    return Array.from(this.map.values()).sort(
      (a, b) => a.generated_at_iso.localeCompare(b.generated_at_iso) * -1
    );
  }
  async get(id: string): Promise<ReportRecord | undefined> {
    return this.map.get(id);
  }
  async put(r: ReportRecord): Promise<void> {
    this.map.set(r.report_id, r);
  }
  async patch(
    id: string,
    patch: Partial<Pick<ReportRecord, "notes" | "variance" | "compliance" | "status">>
  ): Promise<ReportRecord> {
    const cur = this.map.get(id);
    if (!cur) throw new Error("report not found");
    const next = { ...cur, ...patch, updated_at_iso: nowISO() };
    this.map.set(id, next);
    return next;
  }
}

const repo = new MemoryReportRepo();

/* --------------------------- Factory (simple) -------------------------- */

type ActiveLight = {
  active_id: string;
  direction: "inbound" | "outbound";
  order_numbers: { po_no?: string; so_no?: string };
  parties: { counterparty_name: string; our_name: string };
  totals: { subtotal: number; lines: number };
};

function makeReportFromActive(a: ActiveLight): ReportRecord {
  return {
    report_id: id("REP"),
    source_active_id: a.active_id,
    direction: a.direction,
    order_numbers: a.order_numbers,
    parties: a.parties,
    status: "draft",
    totals: a.totals,
    generated_at_iso: nowISO(),
    updated_at_iso: nowISO(),
    notes: "Auto-generated from Active.",
  };
}

/* --------------------------------- GET --------------------------------- */
// GET /api/business/oms/obari/report
// GET /api/business/oms/obari/report?id=REP_xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const item = await repo.get(id);
    if (!item) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, report: item });
  }

  const items = await repo.list();
  return NextResponse.json({ ok: true, items });
}

/* --------------------------------- POST -------------------------------- */
// POST body: { from_active: { active_id, direction, order_numbers, parties, totals } }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const act = body?.from_active as ActiveLight | undefined;
    if (!act?.active_id) {
      return NextResponse.json({ ok: false, error: "from_active required" }, { status: 400 });
    }

    const rep = makeReportFromActive(act);
    await repo.put(rep);
    return NextResponse.json({ ok: true, report: rep });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "failed to create report" },
      { status: 400 }
    );
  }
}

/* -------------------------------- PATCH -------------------------------- */
// PATCH body: { id: "REP_xxx", notes?: string, variance?: {reason,delta_minor}, compliance?: {ok,missing}, status?: "final"|"draft" }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = String(body?.id || "");
    if (!id) {
      return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
    }

    const patch = {
      notes: body?.notes,
      variance: body?.variance,
      compliance: body?.compliance,
      status: body?.status,
    };

    const updated = await repo.patch(id, patch);
    return NextResponse.json({ ok: true, report: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "failed to update report" },
      { status: 400 }
    );
  }
}
