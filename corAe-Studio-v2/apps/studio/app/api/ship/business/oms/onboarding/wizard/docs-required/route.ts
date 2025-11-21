// apps/studio/app/api/business/oms/onboarding/wizard/docs-required/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET  -> predict minimal docs for (sector, serviceType, orderType)
// POST -> persist selected required docs for a deal

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = (searchParams.get("sector") || "").trim();
  const serviceType = (searchParams.get("serviceType") || "").trim();
  const orderType = (searchParams.get("orderType") || "oneOff").trim();

  // Simple heuristic map (extend with your own logic or ML)
  const base: any[] = [];
  if (sector && serviceType) {
    base.push({ documentType: "Quote/Proposal", category: "COMMERCIAL", requiredFrom: "CLIENT", mandatory: true });
    if (orderType !== "oneOff") base.push({ documentType: "Framework Agreement", category: "COMMERCIAL", requiredFrom: "CLIENT", mandatory: true });
    if (/waste|clean/i.test(sector)) base.push({ documentType: "Risk Assessment / Method Statement", category: "OPERATIONAL", requiredFrom: "SUPPLIER", mandatory: true });
  }

  return NextResponse.json({ ok: true, predictions: base });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dealId = String(body.dealId || "").trim();
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

  const requiredDocs = (body.requiredDocs || []) as Array<{
    documentType: string;
    category: "COMMERCIAL" | "OPERATIONAL";
    requiredFrom: "CLIENT" | "SUPPLIER" | "SUBCONTRACTOR" | "PARTNER";
    mandatory: boolean;
  }>;

  // Persist into a DealRequirement table if present; fallback to deal.meta
  try {
  await prisma.$transaction(async (tx: any) => {
      // clear and insert (idempotent-ish)
      await (tx as any).dealRequirement.deleteMany({ where: { dealId } }).catch(()=>{});
      for (const d of requiredDocs) {
        await (tx as any).dealRequirement.create({
          data: { dealId, phase: "BTDO", ...d } as any,
        }).catch(()=>{});
      }
      // backup into meta
      await tx.deal.update({
        where: { id: dealId },
        data: { meta: { docsRequired: requiredDocs } as any },
      }).catch(()=>{});
    });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Could not persist docs" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
