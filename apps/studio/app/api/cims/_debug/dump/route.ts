// app/api/cims/_debug/dump/route.ts
import { NextResponse } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * DEV-ONLY: Dump full in-memory CIMS store.
 *
 * GET /api/cims/_debug/dump
 *   → { ok, inbox, outbox, signals, totals }
 *
 * Optional query:
 *   ?domain=finance|operations|marketing|all
 *
 * Use for debugging local development — never expose in production.
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const domain = (url.searchParams.get("domain") ?? "all") as
    | "management"
    | "hr"
    | "finance"
    | "operations"
    | "marketing"
    | "all";

  try {
    const [inbox, outbox, signals] = await Promise.all([
      CIMSStore.inbox.list(domain),
      CIMSStore.outbox.list(domain),
      CIMSStore.signals.list(domain),
    ]);

    return NextResponse.json({
      ok: true,
      domain,
      totals: {
        inbox: inbox.length,
        outbox: outbox.length,
        signals: signals.length,
      },
      inbox,
      outbox,
      signals,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("GET /api/cims/_debug/dump failed:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to dump CIMS store" },
      { status: 500 }
    );
  }
}
