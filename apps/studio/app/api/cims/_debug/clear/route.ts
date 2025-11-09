import { NextResponse, NextRequest } from "next/server";
import {
  CIMSStore,
  pushInbox,
  pushOutbox,
  pushSignal,
  type CIMSDomain,
} from "@/app/lib/cims/store";

/**
 * DEV-ONLY SEEDER (150% reconciled)
 *
 * GET  /api/cims/_debug/seed
 *   → { ok, currentCounts, seededThisBoot, usage/examples }
 *
 * POST /api/cims/_debug/seed[?preset=basic|ops|finance|marketing][&force=1]
 * body (optional): { count?: number, domain?: CIMSDomain }
 *   → seeds demo Inbox/Outbox/Signals
 *
 * Features merged:
 *  - One-time seeding guard per boot (toggle with ?force=1)
 *  - Presets + repeat count + optional domain targeting
 *  - Non-destructive; only appends
 *
 * ⚠️ Keep in development only; protect/remove in production.
 */

type Preset = "basic" | "ops" | "finance" | "marketing";
let SEEDED = false;

// ------------ helpers ------------
function parsePreset(raw: string | null | undefined): Preset {
  switch (raw) {
    case "ops":
    case "finance":
    case "marketing":
    case "basic":
      return raw;
    default:
      return "basic";
  }
}

async function counts() {
  const [inbox, outbox, signals] = await Promise.all([
    CIMSStore.inbox.list("all"),
    CIMSStore.outbox.list("all"),
    CIMSStore.signals.list("all"),
  ]);
  return { inbox: inbox.length, outbox: outbox.length, signals: signals.length };
}

function rand() {
  return Math.floor(100 + Math.random() * 900).toString();
}

async function seedOnce(preset: Preset, forceDomain?: CIMSDomain) {
  const d = forceDomain;

  switch (preset) {
    case "ops": {
      await pushInbox("Approval requested: PO #A10" + rand(), {
        hint: "Requires Owner or Admin",
        type: "automate",
        domain: d ?? "operations",
        from: "System • Automate",
      });
      await pushOutbox(
        "Vendor: Demo Partner",
        "Price confirmation request (Pricelock policy attached)",
        { status: "sent", domain: d ?? "operations" }
      );
      await pushSignal("Competitor price drop detected on SKU-PEPSI-500", {
        source: "Automate • Market",
        level: "warn",
        domain: d ?? "operations",
      });
      break;
    }

    case "finance": {
      await pushInbox("Cash runway warning (AED 6.2k needed today)", {
        type: "system",
        domain: d ?? "finance",
        from: "Finance Bot",
      });
      await pushOutbox(
        "Accounts",
        "Payment batch released (Ref: PB-" + rand() + ")",
        { status: "queued", domain: d ?? "finance" }
      );
      await pushSignal("Guard `creditLimit` blocked vendor payout", {
        source: "Automate • Guard",
        level: "critical",
        domain: d ?? "finance",
      });
      break;
    }

    case "marketing": {
      await pushInbox("Customer campaign: Ramadan bundle creatives ready", {
        type: "vendor",
        domain: d ?? "marketing",
        from: "Creative Partner",
      });
      await pushOutbox("Influencer: Aisha", "Brief + assets shared", {
        status: "sent",
        domain: d ?? "marketing",
      });
      await pushSignal("CTR dip on Story ads (−18%) vs prior week", {
        source: "Ads Monitor",
        level: "info",
        domain: d ?? "marketing",
      });
      break;
    }

    case "basic":
    default: {
      await pushInbox("Approval requested: PO #A10" + rand(), {
        hint: "Requires Owner or Admin",
        type: "automate",
        domain: d ?? "operations",
        from: "System • Automate",
      });
      await pushInbox("Daily check: +1% market beat maintained", {
        type: "system",
        domain: d ?? "management",
        from: "CAIA",
      });

      await pushOutbox("Team: Ops", "Shelf price update reminder", {
        status: "queued",
        domain: d ?? "operations",
      });
      await pushOutbox("Customer", "Order confirmation & delivery window", {
        status: "failed",
        domain: d ?? "marketing",
      });

      await pushSignal("Guard `withinCeiling` blocked workflow run", {
        source: "Automate • Guard",
        level: "critical",
        domain: d ?? "operations",
      });
      break;
    }
  }
}

// ------------ handlers ------------
export async function GET() {
  const c = await counts();
  return NextResponse.json({
    ok: true,
    seededThisBoot: SEEDED,
    currentCounts: c,
    info: "POST to seed demo data. Optional ?preset=basic|ops|finance|marketing",
    examples: {
      basic: { method: "POST", url: "/api/cims/_debug/seed?preset=basic" },
      ops: { method: "POST", url: "/api/cims/_debug/seed?preset=ops" },
      finance: { method: "POST", url: "/api/cims/_debug/seed?preset=finance" },
      marketing: {
        method: "POST",
        url: "/api/cims/_debug/seed?preset=marketing",
      },
      withBody: {
        method: "POST",
        url: "/api/cims/_debug/seed?preset=ops",
        body: { count: 2, domain: "operations" as CIMSDomain },
      },
      forceReseed: {
        method: "POST",
        url: "/api/cims/_debug/seed?preset=basic&force=1",
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const preset = parsePreset(req.nextUrl.searchParams.get("preset"));
    const force = req.nextUrl.searchParams.get("force") === "1";
    const body = await req.json().catch(() => ({} as any));
    const count = Number.isFinite(body?.count) ? Math.max(1, body.count) : 1;
    const domain = (body?.domain as CIMSDomain | undefined) ?? undefined;

    if (SEEDED && !force) {
      return NextResponse.json({
        ok: true,
        info: "Already seeded this boot. Use ?force=1 to re-seed.",
      });
    }

    for (let i = 0; i < count; i++) {
      await seedOnce(preset, domain);
    }
    SEEDED = true;

    const c = await counts();
    return NextResponse.json({
      ok: true,
      preset,
      count,
      domain: domain ?? "mixed",
      newCounts: c,
      forced: force,
    });
  } catch (err) {
    console.error("POST /api/cims/_debug/seed failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to seed demo data" },
      { status: 500 }
    );
  }
}
