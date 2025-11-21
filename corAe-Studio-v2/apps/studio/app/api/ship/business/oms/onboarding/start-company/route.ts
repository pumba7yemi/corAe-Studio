// apps/studio/app/api/business/onboarding/start-company/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bootstrapCompany } from "@/app/lib/business/bootstrap";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ownerUserId, companyName } = body ?? {};
    const res = await bootstrapCompany({ ownerUserId, companyName });
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed" }, { status: 400 });
  }
}
