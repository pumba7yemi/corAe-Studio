import { WorkflowSpec } from "./schema";
import { emit } from "./events";
import { saveInstance, loadInstance, updateInstance } from "./stores";

export async function startWorkflow(specId: string, ctx: any) {
  const inst = await saveInstance({ specId, ctx, status: "running", at: 0 });
  return { instanceId: inst.id };
}

export async function step(instanceId: string, approve?: boolean) {
  const inst = await loadInstance(instanceId);
  const spec: WorkflowSpec = inst.spec;
  const cp = spec.checkpoints[inst.at];

  if (cp.gate === "human-approve" && approve !== true) {
    return { blocked: true, checkpoint: cp.id };
  }

  try {
    await emit(cp.onSuccess ?? [], inst);
    const at = inst.at + 1;
    const done = at >= spec.checkpoints.length;
    await updateInstance(instanceId, { at, status: done ? "done" : "running" });
    if (done && spec.nextWorkflows?.length) {
      for (const next of spec.nextWorkflows) emit(["workflow.queue", next], inst);
    }
    return { ok: true, done };
  } catch (e) {
    await emit(cp.onFail ?? [], inst, e);
    await updateInstance(instanceId, { status: "error" });
    return { ok: false, error: String(e) };
  }
}
