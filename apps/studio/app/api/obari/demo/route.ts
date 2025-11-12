import { NextRequest } from "next/server";
import { readShipMemory, writeShipMemory } from "@/src/caia/memory";

export const runtime = "nodejs";
export const revalidate = 0;

type State = { step: string; ts: string };

const STATES = ["start", "gather", "decide", "complete"];

async function load(): Promise<State> {
  const data = (await readShipMemory("obari-demo", "state")) as State | undefined;
  if (!data || !data.step) return { step: "start", ts: new Date().toISOString() };
  return data;
}

async function save(s: State) {
  await writeShipMemory("obari-demo", "state", s);
}

export async function GET(_: NextRequest) {
  try {
    const s = await load();
    return Response.json({ ok: true, state: s });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = (body && body.action) || "next";
    const cur = await load();
    let idx = STATES.indexOf(cur.step);
    if (idx === -1) idx = 0;
    if (action === "next") idx = Math.min(STATES.length - 1, idx + 1);
    if (action === "reset") idx = 0;
    const next = { step: STATES[idx], ts: new Date().toISOString() };
    await save(next);
    return Response.json({ ok: true, state: next });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
