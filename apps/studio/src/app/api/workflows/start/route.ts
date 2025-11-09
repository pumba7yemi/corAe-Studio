import { NextResponse } from "next/server";
import { z } from "zod";

// Import only startWorkflow statically; load `engine` dynamically at runtime to avoid redeclaring a block-scoped `engine`
import { startWorkflow } from "../../../../services/workflows";

// Basic schema for POST payload
const StartSchema = z.object({
  workflowId: z.string(),
  data: z.any().optional(),
});

// Optional: quick health probe (GET /api/workflows/start)
export async function GET(): Promise<NextResponse> {
  // dynamically import to keep `engine` out of the top-level scope and avoid redeclaration errors
  const { engine } = await import("../../../../services/workflows");
  return NextResponse.json({
    ok: true,
    workflows: engine.listWorkflows(),
    hint: "POST here with { workflowId, data } to start a run"
  });
}

// POST /api/workflows/start
export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const { workflowId, data } = StartSchema.parse(json);

    // Start the workflow
    const runId = await startWorkflow(workflowId, data);

    return NextResponse.json({ ok: true, runId });
  } catch (err: any) {
    const message = err?.issues?.[0]?.message || err?.message || "Invalid request";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
