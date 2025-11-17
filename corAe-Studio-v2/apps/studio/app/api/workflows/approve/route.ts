import { NextResponse } from "next/server";
import { approve } from "@/lib/workflowRuntime";

export async function POST(req: Request) {
  try {
    const { runId, checkpoint } = await req.json();
    if (!runId || !checkpoint) {
      return NextResponse.json({ ok: false, error: "runId and checkpoint required" }, { status: 400 });
    }
    await approve(runId, checkpoint);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
