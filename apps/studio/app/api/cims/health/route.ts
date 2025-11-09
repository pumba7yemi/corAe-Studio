import { NextResponse } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * Lightweight health & wiring check for CIMS.
 *
 * GET /api/cims/health
 * → { ok, uptimeSec, totals: { inbox, outbox, signals } }
 *
 * Use this to quickly confirm:
 *  - API route is reachable
 *  - In-memory store is importable
 *  - Lists resolve without throwing
 */

const startedAt = Date.now();

export async function GET() {
  try {
    const [inbox, outbox, signals] = await Promise.all([
      CIMSStore.inbox.list("all"),
      CIMSStore.outbox.list("all"),
      CIMSStore.signals.list("all"),
    ]);

    return NextResponse.json({
      ok: true,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      totals: {
        inbox: inbox.length,
        outbox: outbox.length,
        signals: signals.length,
      },
      hint: "If any totals are 0, POST /api/cims/_debug/seed to add demo data.",
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "CIMS health check failed",
      },
      { status: 500 }
    );
  }
}
