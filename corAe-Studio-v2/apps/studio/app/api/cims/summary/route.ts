import { NextResponse } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * CIMS SYSTEM SUMMARY
 *
 * GET /api/cims/summary
 * → Returns summarized data from Inbox, Outbox, and Signals
 *
 * Designed for quick dashboard preview cards in CIMS UI.
 * Includes totals by domain + recent items (last 3 each).
 */

export async function GET() {
  try {
    const [inbox, outbox, signals] = await Promise.all([
      CIMSStore.inbox.list("all"),
      CIMSStore.outbox.list("all"),
      CIMSStore.signals.list("all"),
    ]);

    // Count by domain
    const domainCount = (arr: any[]) =>
      arr.reduce<Record<string, number>>((acc, item) => {
        const d = item.domain ?? "unspecified";
        acc[d] = (acc[d] ?? 0) + 1;
        return acc;
      }, {});

    const summary = {
      ok: true,
      totals: {
        inbox: inbox.length,
        outbox: outbox.length,
        signals: signals.length,
      },
      domains: {
        inbox: domainCount(inbox),
        outbox: domainCount(outbox),
        signals: domainCount(signals),
      },
      recent: {
        inbox: inbox.slice(0, 3),
        outbox: outbox.slice(0, 3),
        signals: signals.slice(0, 3),
      },
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    console.error("GET /api/cims/summary failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to compile summary" },
      { status: 500 }
    );
  }
}
