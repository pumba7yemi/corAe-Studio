// Use relative import to runtime to ensure resolution in project refs
import { execute } from "../workflows/runtime";
import { canRun, requiredApprovals } from "./policy";
import { logEvent } from "./audit";
import { logToLayer } from "./memory-cube";
import { resolveContext, TenantContext } from "./tenancy";

type RunCtx = {
  userId: string;
  roles: string[];
  ctx?: TenantContext; // optional override (vertical/brand/tenant)
};

/**
 * Run a workflow definition under CAIA control.
 * Enforces policy, approvals, and memory logging.
 */
export async function runWorkflow(def: any, runCtx: RunCtx) {
  const ctx = resolveContext(runCtx.ctx);

  // 1. Policy check
  if (!canRun(def, runCtx)) {
    const denial = { ok: false, error: "Forbidden: policy" };
    await logEvent("run.denied", { wf: def.id, user: runCtx.userId });
    logToLayer("tenant", ctx, {
      type: "workflow.denied",
      data: { workflowId: def.id, user: runCtx.userId, reason: "policy" },
    });
    return denial;
  }

  // 2. Approvals check
  const approvals = requiredApprovals(def);
  if (approvals.length) {
    const pending = { ok: false, pendingApproval: approvals };
    await logEvent("run.pending_approval", { wf: def.id, approvals });
    logToLayer("tenant", ctx, {
      type: "workflow.pending",
      data: { workflowId: def.id, approvals },
    });
    return pending;
  }

  // 3. Execute workflow
  try {
    const res = await execute(def);
    const success = { ok: true, res };
    await logEvent("run.complete", { wf: def.id, res });
    logToLayer("tenant", ctx, {
      type: "workflow.run",
      data: { workflowId: def.id, result: "ok", res },
    });
    return success;
  } catch (e: any) {
    const failure = { ok: false, error: String(e?.message || e) };
    await logEvent("run.error", { wf: def.id, error: failure.error });
    logToLayer("tenant", ctx, {
      type: "workflow.error",
      data: { workflowId: def.id, error: failure.error },
    });
    return failure;
  }
}
