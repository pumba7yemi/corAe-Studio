import { NextResponse } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * GET /api/cims/_debug/stats
 * Summarises in-memory counts and a light estimate of payload sizes.
 * Safe for dev; do not expose sensitive data.
 */
export async function GET() {
  const [inbox, outbox, signals] = await Promise.all([
    CIMSStore.inbox.list("all"),
    CIMSStore.outbox.list("all"),
    CIMSStore.signals.list("all"),
  ]);

  const sizeOf = (obj: unknown) => {
    try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
    catch { return 0; }
  };

  const payloadBytes = sizeOf({ inbox, outbox, signals });

  return NextResponse.json({
    ok: true,
    counts: {
      inbox: inbox.length,
      outbox: outbox.length,
      signals: signals.length,
    },
    approxBytes: payloadBytes,
    at: new Date().toISOString(),
  });
}
