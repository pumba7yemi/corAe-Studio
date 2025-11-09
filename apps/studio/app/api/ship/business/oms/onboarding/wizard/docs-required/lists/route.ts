// apps/studio/app/api/ship/business/oms/onboarding/wizard/docs-required/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealId = (searchParams.get("dealId") || "").trim();
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

  // First try dedicated table; fallback to meta.docsRequired
  try {
    const rows = await (prisma as any).dealRequirement.findMany({ where: { dealId } });
    if (rows?.length) return NextResponse.json({ ok: true, requirements: rows });
  } catch {}

  const deal = await prisma.deal.findUnique({ where: { id: dealId } }) as any;
  const reqs = deal?.meta?.docsRequired || [];
  return NextResponse.json({ ok: true, requirements: reqs });
}