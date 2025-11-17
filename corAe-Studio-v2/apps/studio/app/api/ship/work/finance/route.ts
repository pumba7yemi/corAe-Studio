// apps/studio/app/api/work/finance/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createFinanceEngine,
  InMemoryStorage,
  InMemoryTaskQueue,
  SimpleEventBus,
  type WizardEngine,
} from "@/lib/wizard/wizard";

let _fin: WizardEngine | null = null;
function fin() {
  if (_fin) return _fin;
  _fin = createFinanceEngine({
    storage: new InMemoryStorage(),
    tasks: new InMemoryTaskQueue(),
    bus: new SimpleEventBus(),
  });
  return _fin;
}

/**
 * Finance endpoints (seeded from Operations blueprint when requested)
 * POST:
 *  - { action:"seedCoA", industry:"MANUFACTURING"|"HOTEL"|... }
 *  - { action:"connectBankFeed", provider:"...", auth:{...} }
 *  - { action:"syncStatements", accountId:"..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eng = fin();

    if (body.action === "seedCoA") {
      await eng.enqueueTask("finance-bin", "SeedChartOfAccounts", { industry: body.industry ?? "CUSTOM" });
      return NextResponse.json({ ok: true, seeded: true });
    }

    if (body.action === "connectBankFeed") {
      await eng.enqueueTask("finance-bin", "ConnectBankFeed", { provider: body.provider, auth: body.auth ?? {} });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "syncStatements") {
      await eng.enqueueTask("finance-bin", "SyncStatements", { accountId: body.accountId });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "work/finance" });
}