import { NextResponse } from "next/server";

/**
 * GET /api/cims/_debug/time
 * Returns server time in multiple formats.
 */
export async function GET() {
  const now = new Date();
  return NextResponse.json({
    ok: true,
    iso: now.toISOString(),
    epochMs: now.getTime(),
    locale: now.toLocaleString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
