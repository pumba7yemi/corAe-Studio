// apps/ship/api/obari/order/issue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { issueOrder } from "@/lib/obari/order"; // bridge to OBARI core

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DirectionUI = "PURCHASE" | "SALES";
type WeekRef = "W1" | "W2" | "W3" | "W4";
type ScheduleMode = "CYCLE_28" | "MONTHLY" | "HYBRID";

interface IssuePayload {
  direction: DirectionUI;
  itemCode: string;
  description?: string;
  qty: number;
  unit?: string;
  unitPrice: number;
  currency?: string;
  taxCode?: string | null;
  scheduleMode: ScheduleMode;
  expectedWeek?: WeekRef;
  vendorCode?: string;
  customerCode?: string;
  notes?: string | null;
}

const id = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const toMinor = (n: number) => Math.round(Number(n) * 100);
const bad = (msg: string, status = 400) =>
  NextResponse.json({ ok: false, error: msg }, { status });

function ensureMinor(price: number): number {
  return price < 1000 ? toMinor(price) : Math.round(price);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IssuePayload;
    const dir = String(body.direction || "").toUpperCase() as DirectionUI;
    if (dir !== "PURCHASE" && dir !== "SALES")
      return bad("direction must be PURCHASE or SALES");

    const item = String(body.itemCode || "").trim();
    if (!item) return bad("itemCode required");

    const qty = Number(body.qty);
    if (!Number.isFinite(qty) || qty <= 0) return bad("qty must be > 0");

    const price = Number(body.unitPrice);
    if (!Number.isFinite(price) || price < 0) return bad("unitPrice invalid");

    const sched = (body.scheduleMode || "CYCLE_28") as ScheduleMode;
    const week = (body.expectedWeek || null) as WeekRef | null;
    if (week && !["W1", "W2", "W3", "W4"].includes(week))
      return bad("expectedWeek invalid");

    const vendor =
      dir === "PURCHASE" ? String(body.vendorCode || "Vendor0001") : undefined;
    const customer =
      dir === "SALES" ? String(body.customerCode || "Customer0001") : undefined;

    const created = await issueOrder({
      direction: dir,
      itemCode: item,
      description: body.description?.trim() || undefined,
      qty,
      unit: (body.unit || "").trim() || "EA",
      unitPrice: ensureMinor(price),
      currency: (body.currency || "").trim() || undefined,
      taxCode: (body.taxCode ?? "").trim() || undefined,
      scheduleMode: sched,
      expectedWeek: week ?? undefined,
      vendorCode: vendor,
      customerCode: customer,
      notes: (body.notes ?? "").trim() || undefined,
    });

    const plain = JSON.parse(JSON.stringify(created));
    return NextResponse.json({ ok: true, data: plain });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Failed to issue order." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    info: "POST this route with an order payload to create an OBARI order.",
  });
}