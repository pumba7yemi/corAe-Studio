import { NextResponse } from "next/server";

/**
 * GET /api/cims/_debug/ping
 * Simple reachability check.
 */
export async function GET() {
  const now = new Date();
  return NextResponse.json({
    ok: true,
    pong: true,
    iso: now.toISOString(),
    epochMs: now.getTime(),
  });
}
