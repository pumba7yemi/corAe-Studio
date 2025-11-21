import { NextResponse } from "next/server";
import { handleAudit } from "../../../../../../GOVERNANCE/api/audit";

export async function GET() {
  try {
    return NextResponse.json(handleAudit());
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}
