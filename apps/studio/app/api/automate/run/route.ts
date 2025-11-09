import { NextResponse } from "next/server";
import { runStep } from "@/app/lib/automate/engine";
import { pushSignal } from "@/app/lib/cims/store";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const result = await runStep(body);
  pushSignal(`Workflow ${body.workflow.name} executed`, { source: "Automate • Engine", level: "info" });
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
  pushSignal(`Error: ${err.message}`, { source: "Automate • Engine", level: "critical" });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
