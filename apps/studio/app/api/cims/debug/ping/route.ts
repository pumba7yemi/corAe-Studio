import { NextResponse } from "next/server";

/** GET /api/cims/debug/ping */
export async function GET() {
  const now = new Date();
  return NextResponse.json({
    ok: true,
    pong: true,
    iso: now.toISOString(),
    epochMs: now.getTime(),
  });
}
