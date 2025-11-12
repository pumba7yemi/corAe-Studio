import { NextResponse } from "next/server";
import { readShipMemory } from "@corae/caia-core/dist/memory";

const SCOPE = "social-contract-audit";
const KEY = "entries";

export async function GET() {
  try {
    const store = await readShipMemory(SCOPE);
    const raw = (store as any)?.get ? (store as any).get(KEY) : (store as any)?.[KEY];
    const entries = raw ? JSON.parse(raw) : [];
    const domains = { home: false, work: false, business: false };
    for (const e of entries) {
      const d = String(e?.domain ?? "").toLowerCase();
      if (d === "home") domains.home = true;
      if (d === "work") domains.work = true;
      if (d === "business") domains.business = true;
    }
    return NextResponse.json({ ok: true, domains });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
