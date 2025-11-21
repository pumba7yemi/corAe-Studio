import { NextResponse } from "next/server";

/**
 * CIMS API Directory
 *
 * GET /api/cims/index
 * → Returns a catalog of available CIMS endpoints for quick discovery.
 *
 * Tip: open /api/cims/index in the browser during dev.
 */

type Entry = {
  method: "GET" | "POST";
  path: string;
  desc: string;
  query?: Record<string, string>;
  bodyExample?: unknown;
};

const entries: Entry[] = [
  // Threads & Messages
  { method: "GET",  path: "/api/cims/threads",  desc: "List threads", query: { tenant: "demo (optional)" } },
  { method: "POST", path: "/api/cims/threads",  desc: "Create a thread", bodyExample: { subject: "New Thread" } },

  { method: "GET",  path: "/api/cims/messages", desc: "List messages in a thread", query: { threadId: "required", tenant: "demo (optional)" } },
  { method: "POST", path: "/api/cims/messages", desc: "Send message to a thread", bodyExample: { threadId: "thread-id", body: "Hello", author: "user", tenant: "demo" } },

  // Inbox
  { method: "GET",  path: "/api/cims/inbox",          desc: "List inbox", query: { domain: "all|management|hr|finance|operations|marketing" } },
  { method: "POST", path: "/api/cims/inbox/status",   desc: "Set inbox status", bodyExample: { id: "in-1", status: "approved|escalated|archived|new" } },
  { method: "POST", path: "/api/cims/inbox/approve",  desc: "Alias → approve item", bodyExample: { id: "in-1" } },
  { method: "POST", path: "/api/cims/inbox/escalate", desc: "Alias → escalate item", bodyExample: { id: "in-1" } },
  { method: "POST", path: "/api/cims/inbox/archive",  desc: "Alias → archive item", bodyExample: { id: "in-1" } },
  { method: "POST", path: "/api/cims/inbox/remove",   desc: "Remove inbox item", bodyExample: { id: "in-1" } },

  // Outbox
  { method: "GET",  path: "/api/cims/outbox",       desc: "List outbox", query: { domain: "all|management|hr|finance|operations|marketing" } },
  { method: "POST", path: "/api/cims/outbox/retry", desc: "Retry failed outbox item", bodyExample: { id: "out-3" } },

  // Signals
  { method: "GET",  path: "/api/cims/signals",     desc: "List signals", query: { domain: "all|management|hr|finance|operations|marketing" } },
  { method: "POST", path: "/api/cims/signals/ack", desc: "Acknowledge a signal", bodyExample: { id: "sig-1" } },

  // Debug & Test
  { method: "GET",  path: "/api/cims/test",          desc: "Health + counts" },
  { method: "POST", path: "/api/cims/test",          desc: "Add test inbox item", bodyExample: { message: "Hello", domain: "operations" } },
  { method: "GET",  path: "/api/cims/_debug/seed",   desc: "View seed help + counts" },
  { method: "POST", path: "/api/cims/_debug/seed",   desc: "Seed demo data", query: { preset: "basic|ops|finance|marketing" }, bodyExample: { count: 2, domain: "operations" } },
];

export async function GET() {
  return NextResponse.json({
    ok: true,
    title: "CIMS API Directory",
    hint: "Use these endpoints during development. Most accept JSON bodies.",
    endpoints: entries,
  });
}
