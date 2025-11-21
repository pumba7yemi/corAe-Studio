export type WorkFocusId = string;

export type Action =
  | { type: "learn"; ref: string }
  | { type: "task"; ref: string; payload?: Record<string, any> }
  | { type: "notify"; ref: string; payload?: Record<string, any> }
  | { type: "run"; ref: string; payload?: Record<string, any> }
  | { type: "webhook"; ref: string; payload?: Record<string, any> };

export interface WorkFocusNode {
  id: WorkFocusId;
  title: string;
  prompt: string;      // “Have you …?”
  role: string;        // Owner/Finance/etc
  requires?: WorkFocusId[];
  meta?: Record<string, any>;
  onNo?: { actions?: Action[]; goto?: WorkFocusId };
  onYes?: { actions?: Action[]; goto?: WorkFocusId };
}

export interface WorkFocusBundle {
  id: string;          // companyId or flow key
  title: string;
  nodes: WorkFocusNode[];
}

export type Answer = "yes" | "no";

export interface EngineResult {
  nextId?: WorkFocusId;
  actions: Action[];
  log: string[];
}
