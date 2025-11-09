import { NextResponse } from "next/server";

/**
 * GET /api/cims/_debug/routes
 * Lists handy CIMS routes that should exist in this build.
 * (Purely informational; does not probe network.)
 */
export async function GET() {
  const now = new Date().toISOString();
  return NextResponse.json({
    ok: true,
    at: now,
    routes: [
      "/api/cims",                // summary
      "/api/cims/inbox",
      "/api/cims/inbox/status",
      "/api/cims/inbox/approve",
      "/api/cims/inbox/escalate",
      "/api/cims/inbox/archive",
      "/api/cims/inbox/remove",
      "/api/cims/outbox",
      "/api/cims/outbox/retry",
      "/api/cims/signals",
      "/api/cims/signals/ack",
      "/api/cims/threads",
      "/api/cims/messages",
      // debug helpers (this set)
      "/api/cims/_debug/ping",
      "/api/cims/_debug/time",
      "/api/cims/_debug/env",
      "/api/cims/_debug/stats",
      "/api/cims/_debug/routes",
    ],
    note: "This is a static list for developer convenience.",
  });
}
