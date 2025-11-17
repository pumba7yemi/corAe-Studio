import { NextResponse } from "next/server";
import { RAM } from "@/lib/memory";
import path from "node:path";
import { promises as fs } from "node:fs";

type Backend = "kv" | "ram";
const BACKEND: Backend = (process.env.CORAE_MEMORY_BACKEND as Backend) ?? "ram";

/** POST { runId?: string, spec?: string } ; spec defaults to corae.flow.json */
export async function POST(req: Request) {
  try {
    const { runId: reqRunId, spec: specName } = await req.json().catch(() => ({} as any));
    const runId = reqRunId || `tenant:flow:${Date.now()}`;
    const specFile = specName || "corae.flow.json";

    const specPath = path.join(process.cwd(), "..", "..", "packages", "workflows-core", "specs", specFile);
    const spec = JSON.parse(await fs.readFile(specPath, "utf8"));

    // initialise state
    await RAM.set(runId, "wf.state", { i: 0, approvals: {} });
    await RAM.set(runId, "wf.spec", spec);

    return NextResponse.json({ ok: true, runId, spec: spec.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
