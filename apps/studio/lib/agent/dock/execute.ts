import { resolve } from "./registry";
// Local minimal type definitions to avoid module resolution issues.
// Replace these with the canonical types from the agents-core package
// once the monorepo/tsconfig path mapping or package install is fixed.
type AgentTask = { id: string; kind: string; [key: string]: any };
type AgentResult = { id: string; status: string; notes?: string; [key: string]: any };

export async function executeTask(task: AgentTask): Promise<AgentResult> {
  const [agent] = resolve(task.kind as any);
  if (!agent) return { id: task.id, status: "error", notes: "No agent for capability" };
  const res = await agent.invoke(task);
  return res;
}