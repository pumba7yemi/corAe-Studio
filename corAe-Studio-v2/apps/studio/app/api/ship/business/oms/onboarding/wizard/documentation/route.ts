// apps/studio/app/api/business/oms/onboarding/wizard/documentation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DocIn = { type: string; url: string; notes?: string; issuedAt?: string; expiresAt?: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { dealId: string; commercial: DocIn[]; operational: DocIn[] };
    const dealId = String(body.dealId || "").trim();
    if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

    const docs = [
      ...body.commercial.map(d => ({ ...d, category: "COMMERCIAL" })),
      ...body.operational.map(d => ({ ...d, category: "OPERATIONAL" })),
    ];

  await prisma.$transaction(async (tx: any) => {
      // If you have a DealDocument table:
      for (const d of docs) {
        await (tx as any).dealDocument.create({
          data: {
            dealId,
            category: d.category,
            documentType: d.type,
            url: d.url,
            notes: d.notes || null,
            issuedAt: d.issuedAt ? new Date(d.issuedAt) : null,
            expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
          } as any,
        }).catch(()=>{});
      }

      // Also snapshot under meta
      await tx.deal.update({
        where: { id: dealId },
        data: {
          meta: { documentation: docs, documentationAt: new Date().toISOString() } as any,
        },
      }).catch(()=>{});
    });

    await safeChrono({ scope:"OPERATIONS", message:`Documentation saved (${docs.length})`, refType:"Deal", refId:dealId, dealId });

    return NextResponse.json({ ok: true });
  } catch (err:any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}

async function safeChrono(data:any){ try{ await (prisma as any).chrono.create({ data }); }catch{} }
