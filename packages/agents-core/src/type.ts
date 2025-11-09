// packages/agents-core/src/types.ts
export type AgentTask = {
  id: string;                     // WF-2025-10-27-0012
  kind: "WHITE_LABEL_BUILD" | "AUTO_WORKFLOW" | "REPORT";
  payload: Record<string, any>;   // agent-specific params
  deadline?: string;              // ISO
  replyUrl: string;               // corAe webhook to POST results
  auth: { token: string };        // short-lived, agent-scoped
};