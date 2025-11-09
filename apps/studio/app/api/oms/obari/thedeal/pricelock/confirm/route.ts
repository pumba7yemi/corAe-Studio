import { NextResponse } from "next/server";
import { setDealFlags } from "../../_store";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const dealId = String(body.dealId || "");
  if (!dealId) {
    return NextResponse.json({ ok: false, error: "dealId required" }, { status: 400 });
  }
  const updated = setDealFlags(dealId, { pricelockConfirmed: true });
  return NextResponse.json({ ok: true, status: updated, next: `/ship/business/oms/obari/thedeal/sla-escalation?dealId=${dealId}` });
}