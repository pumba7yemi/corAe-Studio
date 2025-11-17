// apps/studio/app/api/system/engines.ts
import { NextResponse } from "next/server";
import { listEngines } from "@/app/system";

export async function GET() {
  try {
    const engines = listEngines();
    return NextResponse.json({ ok: true, engines });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}