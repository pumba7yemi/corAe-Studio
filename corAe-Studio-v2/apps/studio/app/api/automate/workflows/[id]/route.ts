// app/api/automate/workflows/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getWorkflow, updateWorkflow, deleteWorkflow } from "@/app/lib/automate/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/automate/workflows/:id
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const wf = await getWorkflow('demo', id);
  return wf
    ? NextResponse.json({ ok: true, workflow: wf })
    : NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
}

// PUT /api/automate/workflows/:id
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const patch = await req.json().catch(() => null);
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const updated = await updateWorkflow('demo', id, patch);
  return updated
    ? NextResponse.json({ ok: true, workflow: updated })
    : NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
}

// DELETE /api/automate/workflows/:id
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const ok = await deleteWorkflow('demo', id);
  return ok
    ? NextResponse.json({ ok: true, deleted: id })
    : NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
}