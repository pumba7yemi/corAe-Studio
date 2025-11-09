// app/api/automate/workflows/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listWorkflows, createWorkflow } from "@/app/lib/automate/store";
import type { Step, Workflow } from "@/app/lib/automate/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/automate/workflows
export async function GET() {
  const items = await listWorkflows('demo-tenant');
  return NextResponse.json({ ok: true, items });
}

type CreateBody = {
  name: string;
  steps: Step[];
  description?: string;
  labels?: string[];
};

// POST /api/automate/workflows
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CreateBody>;
    if (!body?.name || !Array.isArray(body?.steps)) {
      return NextResponse.json({ ok: false, error: "name and steps are required" }, { status: 400 });
    }

    // TODO: wire to real auth/tenant
    const tenantId = "demo-tenant";
    const createdBy = "owner-user";
    const createdRole = "Owner" as const;

    // shape exactly what createWorkflow expects:
    const input: Omit<Workflow, "id" | "createdAt"> & { id?: string; createdAt?: string } = {
      tenantId,
      name: body.name,
      description: body.description,
      createdBy,
      createdRole,
      labels: body.labels ?? [],
      steps: body.steps as Step[],
    };

    const wf = await createWorkflow(input);
    return NextResponse.json({ ok: true, workflow: wf });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Invalid JSON" }, { status: 400 });
  }
}
