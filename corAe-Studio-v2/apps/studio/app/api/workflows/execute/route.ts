import { NextResponse } from "next/server";
import { execute, type WFDef } from "@/lib/workflowGraph";

export async function GET() {
  // sample graph to smoke-test
  const sample: WFDef = {
    id: "corae.sample",
    nodes: [
      { id: "capture",  type: "step", meta: { desc: "Capture intent" } },
      { id: "validate", type: "step", meta: { desc: "Validate inputs" } },
      { id: "plan",     type: "step", meta: { desc: "Plan" } },
      { id: "execute",  type: "step", meta: { desc: "Run" } },
    ],
    edges: [
      { from: "capture", to: "validate" },
      { from: "validate", to: "plan" },
      { from: "plan", to: "execute" }
    ],
  };

  const out = await execute(sample);
  return NextResponse.json({ ok: true, sample: out });
}

export async function POST(req: Request) {
  try {
    const def = (await req.json()) as WFDef;
    const out = await execute(def);
    return NextResponse.json({ ok: true, result: out });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? String(e) },
      { status: 400 }
    );
  }
}
