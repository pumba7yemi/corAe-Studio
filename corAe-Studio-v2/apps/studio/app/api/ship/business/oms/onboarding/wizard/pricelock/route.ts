// apps/studio/app/api/business/oms/onboarding/wizard/pricelock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  dealId: string;
  price: number;
  currency?: string;
  validFrom?: string;
  validUntil?: string;
  confirmedBy?: string | null;
  meta?: Record<string, any>;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    const dealId = String(body.dealId || "").trim();
    const price = Number(body.price);
    if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });
    if (!price || price <= 0) return NextResponse.json({ error: "valid price required" }, { status: 400 });

    const deal = await prisma.deal.findUnique({ where: { id: dealId }, select: { id: true } });
    if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

    const currency = (body.currency || "AED").toUpperCase();
    const validFrom = body.validFrom ? new Date(body.validFrom) : new Date();
    const validUntil = body.validUntil ? new Date(body.validUntil) : new Date(validFrom.getTime() + 7 * 24 * 3600 * 1000);

    const chain = await (prisma as any).pricelockChain.create({
      data: {
        dealId, price, currency, validFrom, validUntil,
        confirmedBy: body.confirmedBy || null,
        status: body.confirmedBy ? "CONFIRMED" : "PENDING",
        meta: body.meta || { source: "wizard.pricelock" },
      },
      select: { id: true, status: true, confirmedBy: true, validUntil: true },
    });

    await prisma.deal.update({
      where: { id: dealId },
      data: {
        meta: { pricelockChain: { chainId: chain.id, status: chain.status, confirmedBy: chain.confirmedBy, validUntil: chain.validUntil } } as any,
      },
    }).catch(()=>{});

    await safeChrono({ scope: "FINANCE", message: `PricelockChain ${chain.status} at ${price} ${currency}.`, refType: "Deal", refId: dealId, dealId });

    return NextResponse.json({ ok: true, chainId: chain.id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}

async function safeChrono(data:any){ try{ await (prisma as any).chrono.create({ data }); }catch{} }
