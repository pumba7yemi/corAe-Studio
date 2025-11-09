// apps/studio/app/api/finance/pnl/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Demo numbers – wire to your real finance source later
  const pnl = { revenue: 128450, gross: 36200, net: -6200 };
  return NextResponse.json({ ok: true, pnl });
}
