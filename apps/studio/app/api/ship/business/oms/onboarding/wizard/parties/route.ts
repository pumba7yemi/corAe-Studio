// apps/studio/app/api/ship/business/oms/onboarding/wizard/parties/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST { dealId, billTo, shipTo }
 * billTo/shipTo: { companyId?:string; name?:string; email?:string; address?:string }
 */
export async function POST(req: NextRequest) {
  try {
    const { dealId, billTo, shipTo } = await req.json();
    if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

    // Best-effort: persist under deal.meta.parties
    await prisma.deal.update({
      where: { id: dealId },
      data: { meta: { parties: { billTo, shipTo } } as any },
    }).catch(()=>{});

    await safeChrono({ scope:"OPERATIONS", message:"Parties updated (BILL_TO/SHIP_TO)", refType:"Deal", refId:dealId, dealId });
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
async function safeChrono(data:any){ try{ await (prisma as any).chrono.create({ data }); }catch{} }