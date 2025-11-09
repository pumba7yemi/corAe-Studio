import "./plugins/white-label"; // self-registers the example agent
import { executeTask } from "./dock/execute";
import type { AgentTask, AgentResult, Capability } from "./dock/registry";

// Single entrypoint CAIA will call
export async function runAgentTask(kind: Capability, payload: any): Promise<AgentResult> {
  const task: AgentTask = {
    id: `WF-${Date.now()}`,
    kind,
    payload
  };
  const result = await executeTask(task);
  return result;
}