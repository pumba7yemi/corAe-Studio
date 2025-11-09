// apps/studio/app/marketplace/reserve/middleware.ts
/**
 * corAe Reserve™ — Middleware
 * Provides input validation, authentication stubs, and logging for Reserve API routes.
 *
 * Extend this to integrate:
 *  - Role validation (Owner, Workflow Partner™, Vendor)
 *  - API key / session token checks
 *  - Event logging to corAe Intelligence Layer
 */

import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Allow read-only routes freely
  if (req.method === "GET") return NextResponse.next();

  // Basic placeholder validation for write routes
  if (
    req.method === "POST" &&
    !req.headers.get("content-type")?.includes("application/json")
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid content type. JSON required." },
      { status: 400 }
    );
  }

  // Optional role stub (to be replaced by corAe Auth / Work OS)
  const user = req.headers.get("x-user-role") ?? "guest";
  if (user === "guest" && req.method === "POST") {
    return NextResponse.json(
      { ok: false, error: "Unauthorised. Role or session required." },
      { status: 403 }
    );
  }

  // Audit trail stub (will link to corAe Intelligence Layer)
  console.info(`[Reserve Middleware] ${req.method} ${url} by ${user}`);

  return NextResponse.next();
}

/**
 * Matcher pattern
 * Apply to all Reserve API routes for consistency.
 */
export const config = {
  matcher: ["/api/reserve/:path*"],
};