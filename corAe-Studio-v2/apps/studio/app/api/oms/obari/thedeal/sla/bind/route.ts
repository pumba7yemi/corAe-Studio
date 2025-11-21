import { NextResponse } from "next/server";
import { getDeal, setDealFlags } from "../../_store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const dealId = String(body.dealId || "");
  if (!dealId) {
    return NextResponse.json({ ok: false, error: "dealId required" }, { status: 400 });
  }

  // Optional: accept SLA payload; validate later
  const _sla = body.sla || {};

  // Guard: Pricelock should exist before SLA (business rule)
  const flags = getDeal(dealId);
  if (!flags.pricelockConfirmed) {
    return NextResponse.json({ ok: false, error: "Pricelock not confirmed yet" }, { status: 409 });
  }

  const updated = setDealFlags(dealId, { slaBound: true });
  return NextResponse.json({ ok: true, status: updated, next: `/business/oms/obari/active?dealId=${dealId}` });
}
