// apps/studio/app/api/system/diagnostics/route.ts
import { NextResponse } from "next/server"
import { systemDiagnostics } from "@/app/system/diagnostics"

export async function GET() {
  try {
    const report = await systemDiagnostics()
    return NextResponse.json({ ok: true, engines: report })
  } catch (err: any) {
    console.error("[corAe System] Diagnostics failed:", err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}