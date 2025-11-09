// Advance TheDeal → return the next URL (e.g., SLA attach after Pricelock Confirmed)
import { NextResponse } from "next/server";

type AdvanceBody = {
  dealId: string;
  event:
    | "PRICELOCK_CONFIRMED"
    | "CONTRACT_SIGNED"
    | "SLA_BOUND"
    | "GO_ACTIVE";
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AdvanceBody;
    const { dealId, event } = body || {};
    if (!dealId || !event) {
      return NextResponse.json({ ok: false, error: "dealId and event required" }, { status: 400 });
    }

    // TODO (optional): persist in DB
    // await prisma.deal.update({ where: { id: dealId }, data: { lastEvent: event }});

    // Router logic: decide what's next based on event
    let nextUrl: string | null = null;

    switch (event) {
      case "PRICELOCK_CONFIRMED":
        // After Pricelock → attach SLA & escalation
        nextUrl = `/ship/business/oms/obari/thedeal/sla-escalation?dealId=${encodeURIComponent(dealId)}`;
        break;

      case "CONTRACT_SIGNED":
        // If you want to enforce Pricelock before SLA, keep users on thedeal hub
        nextUrl = `/ship/business/oms/obari/thedeal?dealId=${encodeURIComponent(dealId)}&need=pricelock`;
        break;

      case "SLA_BOUND":
        // Once SLA is bound, you can take them to Active gating or summary
        nextUrl = `/ship/business/oms/obari/thedeal?dealId=${encodeURIComponent(dealId)}&ok=sla`;
        break;

      case "GO_ACTIVE":
        // Example of jumping to Active
        nextUrl = `/ship/business/oms/active?dealId=${encodeURIComponent(dealId)}`;
        break;

      default:
        nextUrl = `/ship/business/oms/obari/thedeal?dealId=${encodeURIComponent(dealId)}`;
    }

    return NextResponse.json({ ok: true, nextUrl });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 });
  }
}