import { NextResponse } from "next/server";
export async function GET() {
  try {
    const modPath = require('path').join(process.cwd(), 'corAe-Studio-v2', 'tools', 'timesense-core.mts');
    const mod = await import(modPath as any);
    const plan = mod.getCurrentPlan ? mod.getCurrentPlan() : null;
    const drift = mod.checkDrift ? mod.checkDrift() : { plan: null, activeBlock: null, minutesBehind: 0, mode: 'ok' };
    return NextResponse.json({ ok: true, plan, drift });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e as any)?.message || e) }, { status: 500 });
  }
}
