import { RAM } from "./memory";
export type Checkpoint = {
  id: string;
  // optional gate; allow "human-approve" and other identifiers
  gate?: "human-approve" | string;
  // extra fields per checkpoint (kept open for flexibility)
  [key: string]: any;
};
export type WorkflowSpec = {
  id: string;
  checkpoints: Checkpoint[];
};
import { notify } from "@/lib/notify"; // 👈 send events to CIMS

export type TickResult = { advanced: boolean; at: string; needs?: "human" | "none" };

export type RunState = {
  i: number; // index into checkpoints
  approvals: Record<string, boolean>;
  createdAt: string;
  specId: string;
  error?: string;
};

export async function createRun(runId: string, spec: WorkflowSpec): Promise<RunState> {
  const initial: RunState = { i: 0, approvals: {}, createdAt: new Date().toISOString(), specId: spec.id };
  await RAM.set(runId, "wf.state", initial);
  await RAM.set(runId, "wf.await", { checkpoint: spec.checkpoints[0]?.id ?? "done" });

  // 🔔 CIMS: workflow started
  await notify("workflow_started", { tenantId: "demo", runId, specId: spec.id, at: spec.checkpoints[0]?.id ?? "done" });

  return initial;
}

export async function getRunState(runId: string): Promise<RunState | undefined> {
  const v = await RAM.get<RunState>(runId, "wf.state");
  return v ?? undefined;
}

// Placeholder step performer. Replace with real tool calls per checkpoint id.
async function perform(step: Checkpoint, runId: string): Promise<void> {
  const logs = (await RAM.get<string[]>(runId, "wf.logs")) ?? [];
  logs.push(`[${new Date().toISOString()}] performed:${step.id}`);
  await RAM.set(runId, "wf.logs", logs);

  // 🔔 CIMS: step performed (auto step finished)
  await notify("workflow_step_performed", { tenantId: "demo", runId, checkpoint: step.id });
}

export async function tick(runId: string, spec: WorkflowSpec): Promise<TickResult> {
  const state = (await RAM.get<RunState>(runId, "wf.state")) ?? { i: 0, approvals: {}, createdAt: new Date().toISOString(), specId: spec.id };
  const step = spec.checkpoints[state.i];
  if (!step) {
    await RAM.set(runId, "wf.await", { checkpoint: "done" });

    // 🔔 CIMS: workflow completed
    await notify("workflow_completed", { tenantId: "demo", runId, specId: spec.id });

    return { advanced: false, at: "done", needs: "none" };
  }

  if (step.gate === "human-approve" && !state.approvals?.[step.id]) {
    await RAM.set(runId, "wf.await", { checkpoint: step.id });
    await RAM.set(runId, "wf.state", state);

    // 🔔 CIMS: awaiting human approval
    await notify("workflow_awaiting_approval", { tenantId: "demo", runId, checkpoint: step.id });

    return { advanced: false, at: step.id, needs: "human" };
  }

  try {
    await perform(step, runId);
    state.i += 1;
    await RAM.set(runId, "wf.state", state);
    const next = spec.checkpoints[state.i]?.id ?? "done";
    await RAM.set(runId, "wf.await", { checkpoint: next });

    // 🔔 CIMS: advanced to next
    await notify("workflow_advanced", { tenantId: "demo", runId, from: step.id, to: next });

    return { advanced: true, at: step.id };
  } catch (e: any) {
    state.error = e?.message ?? String(e);
    await RAM.set(runId, "wf.state", state);
    await RAM.set(runId, "wf.await", { checkpoint: step.id, error: state.error });

    // 🔔 CIMS: error at step
    await notify("workflow_error", { tenantId: "demo", runId, checkpoint: step.id, error: state.error });

    return { advanced: false, at: step.id, needs: "human" };
  }
}

export async function approve(runId: string, checkpoint: string): Promise<void> {
  const state = (await RAM.get<RunState>(runId, "wf.state")) ?? { i: 0, approvals: {}, createdAt: new Date().toISOString(), specId: "" };
  state.approvals = state.approvals ?? {};
  state.approvals[checkpoint] = true;
  await RAM.set(runId, "wf.state", state);

  // 🔔 CIMS: approval received
  await notify("workflow_approved", { tenantId: "demo", runId, checkpoint });
}

export async function rollback(runId: string, toCheckpointId: string, spec: WorkflowSpec): Promise<void> {
  const idx = spec.checkpoints.findIndex(c => c.id === toCheckpointId);
  if (idx < 0) throw new Error("Checkpoint not found");
  const state = (await RAM.get<RunState>(runId, "wf.state"))!;
  const from = spec.checkpoints[state.i]?.id ?? "unknown";
  state.i = idx;
  await RAM.set(runId, "wf.state", state);
  await RAM.set(runId, "wf.await", { checkpoint: spec.checkpoints[idx].id });

  // 🔔 CIMS: rolled back
  await notify("workflow_rolled_back", { tenantId: "demo", runId, from, to: toCheckpointId });
}
