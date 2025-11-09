import { RAM } from "@/lib/memory";

export type Gate = "auto" | "human-approve";

export interface FlowSpec {
  id: string;
  version: string;
  checkpoints: { id: string; desc?: string; gate: Gate }[];
  on_error?: "pause_and_notify";
}

type State = {
  i: number; // index into checkpoints
  approvals: Record<string, boolean>;
  meta?: Record<string, unknown>;
};

export type TickResult =
  | { status: "advanced"; at: string; done?: false }
  | { status: "waiting"; at: string; needs: "human" }
  | { status: "done"; at: "done" };

function initState(): State {
  return { i: 0, approvals: {} };
}

/**
 * Tick the flow forward by one step if allowed.
 * runId is a tenant-scoped identifier (e.g. "tenantA:flow:1234").
 */
export async function tick(runId: string, spec: FlowSpec): Promise<TickResult> {
  const keyState = "wf.state";
  let state = (await RAM.get(runId, keyState)) as State | null;
  if (!state) {
    state = initState();
    await RAM.set(runId, keyState, state);
  }

  const step = spec.checkpoints[state.i];
  if (!step) return { status: "done", at: "done" };

  if (step.gate === "human-approve" && !state.approvals[step.id]) {
    await RAM.set(runId, "wf.await", { checkpoint: step.id });
    return { status: "waiting", at: step.id, needs: "human" };
  }

  // TODO: perform(step.id, runId) — intentionally left as no-op for generic corAe
  state.i += 1;
  await RAM.set(runId, keyState, state);
  return { status: "advanced", at: step.id };
}

/** Mark a checkpoint approved by a human. */
export async function approve(runId: string, checkpoint: string) {
  const state = ((await RAM.get(runId, "wf.state")) as State | null) ?? initState();
  state.approvals[checkpoint] = true;
  await RAM.set(runId, "wf.state", state);
}

/** Read the current pointer/status. */
export async function status(runId: string, spec: FlowSpec) {
  const state = ((await RAM.get(runId, "wf.state")) as State | null) ?? initState();
  const step = spec.checkpoints[state.i];
  if (!step) return { at: "done", done: true as const };
  const needsHuman = step.gate === "human-approve" && !state.approvals[step.id];
  return { at: step.id, done: false as const, needsHuman };
}
