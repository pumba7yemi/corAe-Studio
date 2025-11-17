import { execute } from "@/lib/workflows/runtime";
import { logToLayer } from "./memory-cube";
import { resolveContext } from "./tenancy";

type RunCtx = { userId: string; roles: string[]; };

export async function runWorkflow(def: any, runCtx: RunCtx) {
  const ctx = resolveContext();
  try {
    const res = await execute(def);
    logToLayer("tenant", ctx, { type: "workflow.run", data: { id: def.id || "wf", res } });
    return { ok: true, res };
  } catch (e: any) {
    const err = String(e?.message || e);
    logToLayer("tenant", ctx, { type: "workflow.error", data: { id: def.id || "wf", err } });
    return { ok: false, error: err };
  }
}
