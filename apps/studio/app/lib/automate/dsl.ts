// app/lib/automate/types.ts

// Available trigger types (expand as needed)
export type TriggerType =
  | "time"
  | "event"
  | "http"
  | "cron"
  | "manual";

// Available action types (expand as needed)
export type ActionType =
  | "email"
  | "whatsapp"
  | "http_request"
  | "log"
  | "task"
  | "notify";

export interface Trigger {
  id: string;
  type: TriggerType;
  expr: string;            // condition, cron string, or event name
  description?: string;
}

export interface Action {
  id: string;
  type: ActionType;
  payload: Record<string, any>; // e.g., { to, body } for email
  description?: string;
}

export interface Step {
  id: string;
  trigger: Trigger;
  actions: Action[];
  guard?: string; // optional conditional expression
}

export interface WorkflowMeta {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  ownerId?: string; // optional link to user/org
}

export interface Workflow extends WorkflowMeta {
  steps: Step[];
}
