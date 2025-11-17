// app/api/cims/route.ts
import { NextResponse } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * CIMS overview endpoint
 * GET /api/cims  → summary of module health, counts, and useful links
 */
export async function GET() {
  try {
    const [inbox, outbox, signals] = await Promise.all([
      CIMSStore.inbox.list("all"),
      CIMSStore.outbox.list("all"),
      CIMSStore.signals.list("all"),
    ]);

    const routes = {
      base: "/api/cims",
      inbox: {
        list: "/api/cims/inbox",
        approve: "/api/cims/inbox/approve",
        escalate: "/api/cims/inbox/escalate",
        archive: "/api/cims/inbox/archive",
        status: "/api/cims/inbox/status",
        remove: "/api/cims/inbox/remove",
      },
      outbox: {
        list: "/api/cims/outbox",
        retry: "/api/cims/outbox/retry",
      },
      signals: {
        list: "/api/cims/signals",
        ack: "/api/cims/signals/ack",
      },
      threads: {
        list: "/api/cims/threads",
        create: "/api/cims/threads",
      },
      messages: {
        list: "/api/cims/messages?threadId=…",
        create: "/api/cims/messages",
      },
      health: "/api/cims/health",
      version: "/api/cims/version",
      debugSeed: "/api/cims/_debug/seed",
    };

    return NextResponse.json({
      ok: true,
      module: "CIMS",
      status: "ok",
      counts: {
        inbox: inbox.length,
        outbox: outbox.length,
        signals: signals.length,
      },
      routes,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, status: "error", error: err?.message ?? "CIMS overview failed" },
      { status: 500 }
    );
  }
}
