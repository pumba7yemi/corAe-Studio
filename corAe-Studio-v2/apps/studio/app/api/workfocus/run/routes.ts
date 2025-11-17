import { NextResponse } from "next/server";
import { loadBundle } from "@/lib/workfocus/io";
import { WorkFocusEngine } from "@/lib/workfocus/engine";
import { runActions } from "@/lib/workfocus/runActions";
import type { Answer } from "@/lib/workfocus/types";

export async function POST(req: Request) {
  try {
    const { bundleId, nodeId, answer } = await req.json() as { bundleId: string; nodeId: string; answer: Answer };
    if (!bundleId || !nodeId || (answer !== "yes" && answer !== "no")) throw new Error("Need bundleId, nodeId, answer('yes'|'no')");
    const bundle = await loadBundle(bundleId);
    const engine = new WorkFocusEngine(bundle);
    const result = engine.evaluate(nodeId, answer);
    await runActions(result.actions);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
