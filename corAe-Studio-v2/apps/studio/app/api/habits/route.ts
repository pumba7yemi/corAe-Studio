// apps/studio/app/api/habits/route.ts
import { NextRequest } from "next/server";

// caia-core does not currently export HabitPolicy; provide a local alias until it does.
// Replace this with: import { type HabitPolicy } from "@corae/caia-core";
// when the package exports the type.
type HabitPolicy = unknown;

type HabitEntry = unknown;

// caia-core may not export `enableAuto` / `disableAuto` — provide small local shims.
// Replace these with the real exports from caia-core when they become available.
async function enableAuto(key: string): Promise<unknown> {
  const impl = (globalThis as any).__caia_core_enableAuto;
  if (typeof impl === "function") {
    return impl(key);
  }
  throw new Error(
    "enableAuto is not exported by @corae/caia-core; please update caia-core or provide a compatible shim."
  );
}

async function disableAuto(key: string): Promise<unknown> {
  const impl = (globalThis as any).__caia_core_disableAuto;
  if (typeof impl === "function") {
    return impl(key);
  }
  throw new Error(
    "disableAuto is not exported by @corae/caia-core; please update caia-core or provide a compatible shim."
  );
}

// caia-core does not export `recordHabit` — provide a small local shim.
// Replace this with the correct exported function from caia-core when available.
async function recordHabit(task: string, context?: Record<string, unknown>) {
  // If a runtime-provided implementation is attached to globalThis, use it.
  const impl = (globalThis as any).__caia_core_recordHabit;
  if (typeof impl === "function") {
    return impl(task, context) as Promise<{ entry: HabitEntry; policy: HabitPolicy }>;
  }

  // Keep TypeScript happy; throw at runtime to signal the missing export.
  throw new Error(
    "recordHabit is not exported by @corae/caia-core; please update caia-core or provide a compatible shim."
  );
}

// caia-core does not export `listHabits` — provide a small local fallback.
// Replace this with the correct exported function from caia-core when available.
async function listHabits(limit: number) {
  // Return an empty array by default to keep the API working without compile errors.
  // Adjust this to call the real implementation from caia-core once the API is available.
  return [];
}

// caia-core may not export `getHabit` — provide a small local shim.
// Replace this with the real exported function from caia-core when it becomes available.
async function getHabit(key: string): Promise<unknown> {
  const impl = (globalThis as any).__caia_core_getHabit;
  if (typeof impl === "function") {
    return impl(key);
  }
  throw new Error(
    "getHabit is not exported by @corae/caia-core; please update caia-core or provide a compatible shim."
  );
}

type Json =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

function json(body: Json, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });
}

// GET /api/habits?limit=50 → recent habits
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") ?? "50");
    const rows = await listHabits(Number.isFinite(limit) ? limit : 50);
    return json({ ok: true, data: rows });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || "GET_FAILED" }, { status: 500 });
  }
}

/**
 * POST /api/habits
 * Body:
 *  { action: "record", task: string, context?: Record<string,unknown> }
 *  { action: "enable", task?: string, signature?: string }
 *  { action: "disable", task?: string, signature?: string }
 *  { action: "get", task?: string, signature?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const action = String(body?.action ?? "");

    if (action === "record") {
      if (!body?.task) return json({ ok: false, error: "TASK_REQUIRED" }, { status: 400 });
      const { entry, policy } = (await recordHabit(String(body.task), body?.context)) as {
        entry: HabitEntry;
        policy: HabitPolicy;
      };
      return json({ ok: true, data: { entry, policy } });
    }

    if (action === "enable" || action === "disable") {
      const key = String(body?.signature ?? body?.task ?? "");
      if (!key) return json({ ok: false, error: "SIGNATURE_OR_TASK_REQUIRED" }, { status: 400 });
      const updated =
        action === "enable" ? await enableAuto(key) : await disableAuto(key);
      return json({ ok: true, data: updated });
    }

    if (action === "get") {
      const key = String(body?.signature ?? body?.task ?? "");
      if (!key) return json({ ok: false, error: "SIGNATURE_OR_TASK_REQUIRED" }, { status: 400 });
      const found = await getHabit(key);
      return json({ ok: true, data: found });
    }

    return json({ ok: false, error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || "POST_FAILED" }, { status: 500 });
  }
}
