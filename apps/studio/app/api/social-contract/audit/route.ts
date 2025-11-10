import { NextRequest } from "next/server";
import { readShipMemory, writeShipMemory } from "@/caia/memory";
import type { AuditEntry } from "../../../../../../packages/core-culture/src";

export const runtime = "nodejs";

const SCOPE = "social-contract-audit";
const KEY = "entries";

export async function GET() {
  const store = await readShipMemory(SCOPE);
  const raw = store[KEY];
  const entries: AuditEntry[] = raw ? JSON.parse(raw) : [];
  return Response.json({ entries });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuditEntry;
    if (!body?.domain || !Array.isArray(body?.checkedPledges)) {
      return Response.json({ error: "invalid payload" }, { status: 400 });
    }

    const store = await readShipMemory(SCOPE);
    const existingRaw = store[KEY];
    const existing: AuditEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
    const next = [...existing, body];
    await writeShipMemory(SCOPE, { [KEY]: JSON.stringify(next) });

    // best-effort pulse hook for dashboards
    try {
      (process as any).emit?.("pulse:event", { type: "SOCIAL_CONTRACT_AUDIT", payload: body });
    } catch (e) {
      // noop
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "bad payload" }, { status: 400 });
  }
}
