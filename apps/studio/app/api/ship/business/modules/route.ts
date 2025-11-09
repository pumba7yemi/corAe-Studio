// apps/studio/app/api/ship/business/modules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");
  if (!companyId) return NextResponse.json({ ok: false, error: "companyId required" }, { status: 400 });
  const rows = await (prisma as any).companyModule.findMany({ where: { companyId } });
  return NextResponse.json({ ok: true, modules: rows });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { companyId, moduleKey, enabled } = body ?? {};
  if (!companyId || !moduleKey || typeof enabled !== "boolean") {
    return NextResponse.json({ ok: false, error: "companyId, moduleKey, enabled required" }, { status: 400 });
  }
  const rec = await (prisma as any).companyModule.upsert({
    where: { companyId_moduleKey: { companyId, moduleKey } },
    create: { companyId, moduleKey, enabled },
    update: { enabled },
  });
  return NextResponse.json({ ok: true, module: rec });
}