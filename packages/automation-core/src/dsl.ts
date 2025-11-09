// packages/automate-core/src/dsl.ts
import { v4 as uuid } from "uuid";
import type { Action, ActionType, Step, Trigger, TriggerType, Workflow, WorkflowMeta } from "./type";

export const t = (type: TriggerType, expr: string, description?: string): Trigger => ({ id: uuid(), type, expr, description });
export const a = (type: ActionType, payload: Record<string, any>, description?: string): Action => ({ id: uuid(), type, payload, description });
export const step = (trigger: Trigger, actions: Action[], guard?: string): Step => ({ id: uuid(), trigger, actions, guard });

export const workflow = (meta: Omit<WorkflowMeta, "id" | "createdAt">, steps: Step[]): Workflow => ({
  ...meta,
  id: uuid(),
  createdAt: new Date().toISOString(),
  steps,
});