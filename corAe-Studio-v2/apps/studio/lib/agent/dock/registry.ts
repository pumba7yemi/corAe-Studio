export type Capability = "WHITE_LABEL_BUILD" | "AUTO_WORKFLOW" | "REPORT";

export type AgentTask = any;
export type AgentResult = any;

type DockedAgent = {
  name: string;
  capabilities: Capability[];
  invoke: (task: AgentTask) => Promise<AgentResult>;
};

const registry = new Map<string, DockedAgent>();

export function register(agent: DockedAgent) {
  agent.capabilities.forEach(c => registry.set(`${c}:${agent.name}`, agent));
}
export function resolve(cap: Capability): DockedAgent[] {
  return [...registry.values()].filter(a => a.capabilities.includes(cap));
}