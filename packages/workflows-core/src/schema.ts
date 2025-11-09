export type Gate = "auto" | "human-approve";

export interface Checkpoint {
  id: string;
  desc: string;
  gate: Gate;
  input?: string[];
  output?: string[];
  onSuccess?: string[];
  onFail?: string[];
}

export interface WorkflowSpec {
  id: string;
  version: string;
  module: string;
  roleHint?: string[];
  checkpoints: Checkpoint[];
  nextWorkflows?: string[];
}
