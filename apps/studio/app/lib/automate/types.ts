// app/lib/automate/types.ts
export type UUID = string;
export type TenantID = string;
export type UserID = string;

export type Role = "Owner" | "Admin" | "Operator" | "Viewer";

export type TriggerType = "time" | "event" | "condition";

export interface Trigger {
  id: UUID;
  type: TriggerType;
  expr: string;            // cron pattern | event key | boolean expression
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
  guard?: string; // name of a function in guards.ts (optional)
}

export interface WorkflowMeta {
  id: UUID;
  tenantId: TenantID;
  name: string;
  description?: string;
  createdBy: UserID;
  createdRole: Role;
  createdAt: string; // ISO
  labels?: string[];
}

export interface Workflow extends WorkflowMeta {
  steps: Step[];
}

export interface ExecutionContext {
  workflow: Workflow;
  step: Step;
  nowISO: string;
  input?: any;                      // event payload / external data
  vars?: Record<string, any>;       // per-run variables (temp)
}

export interface EngineResult {
  success: boolean;
  actionsRun: Action[];
  guardPassed?: boolean;
  notes?: string[];
}

/** Adapter contracts — host app must provide implementations */
export type MessagingAdapter = {
  send: (payload: any) => Promise<any>;
  sendExternal?: (payload: any) => Promise<any>;
};

export type SheetsAdapter = {
  appendRow: (payload: any) => Promise<any>;
};

export type CommerceAdapter = {
  adjustPrice: (payload: any) => Promise<any>;
};

export type PartnersAdapter = {
  requestConfirmation: (payload: any) => Promise<any>;
  createOrder: (payload: any) => Promise<any>;
  advanceProcess?: (payload: any) => Promise<any>;
  requestVisit?: (payload: any) => Promise<any>;
};

export type Adapters = {
  messaging: MessagingAdapter;
  sheets: SheetsAdapter;
  commerce: CommerceAdapter;
  partners: PartnersAdapter;
};
