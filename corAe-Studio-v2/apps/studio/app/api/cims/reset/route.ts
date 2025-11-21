import { NextResponse, NextRequest } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";

/**
 * CIMS RESET / NORMALIZE (best-effort, in-memory)
 *
 * GET  /api/cims/reset
 *   → Shows usage and current counts
 *
 * POST /api/cims/reset
 *   → Soft reset:
 *      - Inbox: set all to "archived"
 *      - Outbox: set all to "sent"
 *      - Signals: mark all as acknowledged
 *
 * POST /api/cims/reset?hard=1
 *   → Best-effort hard reset (only if store exposes remove() helpers):
 *      - Inbox: remove all items (uses inbox.remove if available)
 *      - Outbox/Signals: no guaranteed delete in store; will fallback to soft
 *
 * NOTE: This operates on our in-memory store only. Safe for dev/demo use.
 */

async function counts() {
  const [inbox, outbox, signals] = await Promise.all([
    CIMSStore.inbox.list("all"),
    CIMSStore.outbox.list("all"),
    CIMSStore.signals.list("all"),
  ]);
  return { inbox: inbox.length, outbox: outbox.length, signals: signals.length };
}

export async function GET() {
  const c = await counts();
  return NextResponse.json({
    ok: true,
    info: "POST to normalize (soft reset). Add ?hard=1 to try a full purge where supported.",
    counts: c,
    examples: {
      soft: { method: "POST", url: "/api/cims/reset" },
      hard: { method: "POST", url: "/api/cims/reset?hard=1" }
    }
  });
}

export async function POST(req: NextRequest) {
  const hard = req.nextUrl.searchParams.get("hard") === "1";

  // Load current data
  const [inbox, outbox, signals] = await Promise.all([
    CIMSStore.inbox.list("all"),
    CIMSStore.outbox.list("all"),
    CIMSStore.signals.list("all"),
  ]);

  // ----- HARD RESET (best-effort) -----
  if (hard) {
    // Inbox: if remove(id) exists, delete all; else fall back to "archived"
    const canRemoveInbox = typeof (CIMSStore.inbox as any).remove === "function";
    if (canRemoveInbox) {
      await Promise.all(inbox.map(i => (CIMSStore.inbox as any).remove(i.id)));
    } else {
      await Promise.all(inbox.map(i => CIMSStore.inbox.setStatus(i.id, "archived")));
    }

    // Outbox / Signals: no guaranteed remove; fall back to normalize
    await Promise.all(outbox.map(o => CIMSStore.outbox.setStatus(o.id, "sent")));
    await Promise.all(signals.map(s => CIMSStore.signals.ack(s.id)));

    const after = await counts();
    return NextResponse.json({ ok: true, mode: "hard", counts: after });
  }

  // ----- SOFT RESET (normalize statuses) -----
  await Promise.all(inbox.map(i => CIMSStore.inbox.setStatus(i.id, "archived")));
  await Promise.all(outbox.map(o => CIMSStore.outbox.setStatus(o.id, "sent")));
  await Promise.all(signals.map(s => CIMSStore.signals.ack(s.id)));

  const after = await counts();
  return NextResponse.json({ ok: true, mode: "soft", counts: after });
}
