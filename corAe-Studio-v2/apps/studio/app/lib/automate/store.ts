// app/lib/automate/store.ts
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { runStep } from "@/app/lib/automate/engine";
import type {
  ExecutionContext,
  EngineResult,
  TenantID,
  Workflow,
} from "@/app/lib/automate/types";

/**
 * Persist per tenant:
 * build/.data/automate/workflows/{tenantId}/{workflowId}.json
 */
const ROOT = path.join(process.cwd(), "build", ".data", "automate", "workflows");

async function ensureTenantDir(tenantId: TenantID) {
  const dir = path.join(ROOT, tenantId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}
function filePath(tenantId: TenantID, id: string) {
  return path.join(ROOT, tenantId, `${id}.json`);
}

/* ------------------------------ CRUD (persisted) ------------------------------ */

export async function listByTenant(tenantId: TenantID): Promise<Workflow[]> {
  const dir = await ensureTenantDir(tenantId);
  const entries = await fs.readdir(dir).catch(() => []);
  const out: Workflow[] = [];
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    const p = path.join(dir, name);
    try {
      const raw = await fs.readFile(p, "utf8");
      const wf = JSON.parse(raw) as Workflow;
      if (wf.tenantId === tenantId) out.push(wf);
    } catch {
      // skip corrupt
    }
  }
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); // newest first
  return out;
}

export async function getById(tenantId: TenantID, id: string): Promise<Workflow | null> {
  await ensureTenantDir(tenantId);
  try {
    const raw = await fs.readFile(filePath(tenantId, id), "utf8");
    const wf = JSON.parse(raw) as Workflow;
    return wf.tenantId === tenantId ? wf : null;
  } catch {
    return null;
  }
}

/** Create new workflow (id/createdAt auto if missing). */
export async function createWorkflow(
  input: Omit<Workflow, "id" | "createdAt"> & { id?: string; createdAt?: string }
): Promise<Workflow> {
  if (!input.tenantId) throw new Error("tenantId is required");
  const id = input.id ?? randomUUID();
  const createdAt = input.createdAt ?? new Date().toISOString();
  const wf: Workflow = { ...(input as any), id, createdAt };
  await ensureTenantDir(wf.tenantId);
  await fs.writeFile(filePath(wf.tenantId, id), JSON.stringify(wf, null, 2), "utf8");
  return wf;
}

/** Full-document save/upsert. Preserves id/createdAt; sets updatedAt. */
export async function saveWorkflow(wf: Workflow): Promise<Workflow> {
  if (!wf.tenantId) throw new Error("tenantId is required");
  if (!wf.id) throw new Error("id is required");
  const existing = await getById(wf.tenantId, wf.id);
  const mergedRaw = {
    ...(existing ?? wf),
    ...wf,
    id: wf.id,
    tenantId: wf.tenantId,
    createdAt: existing?.createdAt ?? wf.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const merged: Workflow = mergedRaw as unknown as Workflow;
  await ensureTenantDir(merged.tenantId);
  await fs.writeFile(filePath(merged.tenantId, merged.id), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

export async function updateWorkflow(
  tenantId: TenantID,
  id: string,
  patch: Partial<Workflow>
): Promise<Workflow | null> {
  const existing = await getById(tenantId, id);
  if (!existing) return null;
  const mergedRaw = {
    ...existing,
    ...patch,
    id: existing.id,
    tenantId: existing.tenantId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
  const merged: Workflow = mergedRaw as unknown as Workflow;
  await fs.writeFile(filePath(tenantId, id), JSON.stringify(merged, null, 2), "utf8");
  return merged;
}

export async function deleteWorkflow(tenantId: TenantID, id: string): Promise<boolean> {
  await ensureTenantDir(tenantId);
  try {
    await fs.unlink(filePath(tenantId, id));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ Execution helpers ------------------------------ */

export async function runFirstStep(
  tenantId: TenantID,
  workflowId: string,
  input?: any,
  vars?: Record<string, any>
): Promise<EngineResult> {
  const wf = await getById(tenantId, workflowId);
  if (!wf) throw new Error("Workflow not found");
  const st = wf.steps[0];
  if (!st) throw new Error("Workflow has no steps");
  const ctx: ExecutionContext = {
    workflow: wf,
    step: st,
    nowISO: new Date().toISOString(),
    input,
    vars,
  };
  return runStep(ctx);
}

export async function runStepById(
  tenantId: TenantID,
  workflowId: string,
  stepId: string,
  input?: any,
  vars?: Record<string, any>
): Promise<EngineResult> {
  const wf = await getById(tenantId, workflowId);
  if (!wf) throw new Error("Workflow not found");
  const st = wf.steps.find((s) => s.id === stepId);
  if (!st) throw new Error("Step not found in workflow");
  const ctx: ExecutionContext = {
    workflow: wf,
    step: st,
    nowISO: new Date().toISOString(),
    input,
    vars,
  };
  return runStep(ctx);
}

// Backwards-compatible wrapper names expected by older callers
export async function getWorkflow(tenantId: TenantID, id: string) {
  return getById(tenantId, id);
}

export async function listWorkflows(tenantId: TenantID) {
  return listByTenant(tenantId);
}
