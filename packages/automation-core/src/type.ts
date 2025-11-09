// packages/automate-core/src/types.ts
export type UUID = string;
export type TenantID = string;     // multi-tenant ready
export type UserID = string;

export type Role = "Owner" | "Admin" | "Operator" | "Viewer";

export type TriggerType = "time" | "event" | "condition";

export interface Trigger {
  id: UUID;
  type: TriggerType;
  expr: string;            // cron, event key, or expression
  description?: string;
}

export type ActionType =
  | "notify.message"
  | "sheet.appendRow"
  | "catalog.adjustPrice"
  | "partner.requestConfirmation"
  | "partner.createOrder"
  | "process.advanceStage"
  | "process.requestVisit";

export interface Action {
  id: UUID;
  type: ActionType;
  payload: Record<string, any>;
  description?: string;
}

export interface Step {
  id: UUID;
  trigger: Trigger;
  actions: Action[];
  guard?: string; // future: guards registry name
}

export interface WorkflowMeta {
  id: UUID;
  tenantId: TenantID;
  name: string;
  description?: string;
  createdBy: UserID;
  createdRole: Role;
  createdAt: string; // ISO
}

export interface Workflow extends WorkflowMeta {
  steps: Step[];
}

export interface ExecutionContext {
  workflow: Workflow;
  step: Step;
  nowISO: string;
  input?: any;
  vars?: Record<string, any>;
}

export interface EngineResult {
  success: boolean;
  actionsRun: Action[];
  notes?: string[];
}