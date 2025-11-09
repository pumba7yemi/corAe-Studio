// app/lib/automate/registry.ts
import type { Adapters, TenantID, Workflow } from "./types";

/** In-memory tenant registry — swap with DB later */
const WORKFLOWS: Record<TenantID, Record<string, Workflow>> = {};
const ADAPTERS: Record<TenantID, Adapters> = {} as any;

export const setAdapters = (tenantId: TenantID, adapters: Adapters) => {
  ADAPTERS[tenantId] = adapters;
};

export const getAdapters = (tenantId: TenantID): Adapters => {
  const a = ADAPTERS[tenantId];
  if (!a) throw new Error(`No adapters registered for tenant ${tenantId}`);
  return a;
};

export const putWorkflow = (wf: Workflow) => {
  if (!WORKFLOWS[wf.tenantId]) WORKFLOWS[wf.tenantId] = {};
  WORKFLOWS[wf.tenantId][wf.id] = wf;
  return wf;
};

export const listWorkflows = (tenantId: TenantID) =>
  Object.values(WORKFLOWS[tenantId] ?? {});

export const getWorkflow = (tenantId: TenantID, id: string) =>
  WORKFLOWS[tenantId]?.[id];
