import { NextResponse } from "next/server";

/**
 * GET /api/cims/_debug/env
 * SAFE snapshot of environment flags (no secrets).
 * Never include actual secrets/tokens/keys here.
 */
export async function GET() {
  const safeEnv = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    NEXT_RUNTIME: process.env.NEXT_RUNTIME ?? "nodejs",
  };

  return NextResponse.json({
    ok: true,
    env: safeEnv,
  });
}
