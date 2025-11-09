import { NextResponse, NextRequest } from "next/server";
import {
  CIMSStore,
  pushInbox,
  pushOutbox,
  pushSignal,
  type CIMSDomain,
} from "@/app/lib/cims/store";

/**
 * DEV-ONLY DEBUG SEEDER
 *
 * GET  /api/cims/_debug/seed
 *      → { ok, counts }
 *
 * POST /api/cims/_debug/seed?force=1
 * body (optional): { domain?: CIMSDomain }
 *      → seeds demo Inbox, Outbox, Signals once per boot
 *         (use ?force=1 to re-seed again)
 *
 * NOTE: This only appends items (no destructive operations).
 * Keep it in dev; remove or protect in prod.
 */

let SEEDED = false;

export async function GET() {
  const [inbox, outbox, signals] = await Promise.all([
    CIMSStore.inbox.list("all"),
    CIMSStore.outbox.list("all"),
    CIMSStore.signals.list("all"),
  ]);

  return NextResponse.json({
    ok: true,
    counts: {
      inbox: inbox.length,
      outbox: outbox.length,
      signals: signals.length,
    },
    seededThisBoot: SEEDED,
  });
}

export async function POST(req: NextRequest) {
  try {
    const force = req.nextUrl.searchParams.get("force") === "1";
    const body = await req.json().catch(() => ({} as any));
    const domain: CIMSDomain | undefined = body?.domain;

    if (SEEDED && !force) {
      return NextResponse.json({
        ok: true,
        info: "Already seeded this boot. Use ?force=1 to re-seed.",
      });
    }

    // --- Inbox examples
    await pushInbox("Approval requested: PO #A102 (Vendor: Demo Partner)", {
      from: "System • Automate",
      hint: "Requires Owner or Admin",
      type: "automate",
      domain: domain ?? "operations",
    });

    await pushInbox("Cash runway warning (AED 6.2k needed today)", {
      from: "Finance Bot",
      type: "system",
      domain: domain ?? "finance",
    });

    // --- Outbox examples
    await pushOutbox(
      "Vendor: Demo Partner",
      "Price confirmation request (Pricelock policy attached)",
      { status: "sent", domain: domain ?? "operations" }
    );

    await pushOutbox("Team: Ops", "Shelf price update reminder", {
      status: "queued",
      domain: domain ?? "operations",
    });

    await pushOutbox("Customer", "Order confirmation & delivery window", {
      status: "failed",
      domain: domain ?? "marketing",
    });

    // --- Signals examples
    await pushSignal("Competitor price drop detected on SKU-PEPSI-500", {
      source: "Automate • Market",
      level: "warn",
      domain: domain ?? "marketing",
    });

    await pushSignal("Guard `withinCeiling` blocked workflow run", {
      source: "Automate • Guard",
      level: "critical",
      domain: domain ?? "operations",
    });

    SEEDED = true;

    const [inbox, outbox, signals] = await Promise.all([
      CIMSStore.inbox.list("all"),
      CIMSStore.outbox.list("all"),
      CIMSStore.signals.list("all"),
    ]);

    return NextResponse.json({
      ok: true,
      seeded: true,
      counts: {
        inbox: inbox.length,
        outbox: outbox.length,
        signals: signals.length,
      },
    });
  } catch (err) {
    console.error("POST /api/cims/_debug/seed failed:", err);
    return NextResponse.json(
      { ok: false, error: "Unable to seed demo data" },
      { status: 500 }
    );
  }
}
