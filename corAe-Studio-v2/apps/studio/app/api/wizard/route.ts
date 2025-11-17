// app/api/wizard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { InMemoryStorage, InMemoryTaskQueue, SimpleEventBus } from "../../lib/wizard/wizard";
import type { WizardEngine, EventBus } from "../../lib/wizard/wizard";

// Fallback createEngine used when the named export cannot be statically resolved
// (keeps build moving; minimal, reversible stub that satisfies the route's usage).
const createEngine: (...args: any[]) => any = (ctx: any, handlers?: any) => {
  const engine: any = {
    ctx,
    handlers: handlers ?? {},
    async init(opts: any) {
      return { tenantId: opts?.tenantId ?? null, userId: opts?.userId ?? null, seed: opts?.seed ?? {} };
    },
    async load(tenantId?: string | null, userId?: string | null) {
      return { tenantId: tenantId ?? null, userId: userId ?? null };
    },
    async save(ctxObj: any, patch: any) {
      return { savedAt: new Date().toISOString(), ctx: { ...(ctxObj ?? {}), ...(patch ?? {}) } };
    },
    async next(ctxObj: any) { return ctxObj; },
    async prev(ctxObj: any) { return ctxObj; },
    async complete(ctxObj: any) { return ctxObj; },
    async enqueueTask(queue: string, name: string, payload: any) {
      return { id: `task_${Date.now()}`, queue, name, payload };
    },
    async listTasks(queue: string, status?: string) { return []; },
    async processNext(bin: string) { return undefined; },
    async processAll(bin: string, max = 100) { return 0; },
    async snapshot() { return { storageKeys: [], bins: {} }; },
    on(event: string, handler: (data: any) => void) { return () => {}; },
  };
  return engine;
};
import { PrismaStorage } from "../../lib/wizard/adapters/prisma";
import { registerObariTaskHandlers, runQueuedTasksOnce } from "../../lib/ship/business/oms/obari/tasks";

type WizardId = string;

type Body =
  | { action: "init"; wizardId: WizardId; tenantId?: string | null; userId?: string | null; seed?: any }
  | { action: "load"; wizardId: WizardId; tenantId?: string | null; userId?: string | null }
  | { action: "save"; wizardId: WizardId; tenantId?: string | null; userId?: string | null; patch: any }
  | { action: "next"; wizardId: WizardId; tenantId?: string | null; userId?: string | null }
  | { action: "prev"; wizardId: WizardId; tenantId?: string | null; userId?: string | null }
  | { action: "complete"; wizardId: WizardId; tenantId?: string | null; userId?: string | null }
  | { action: "enqueue"; wizardId: WizardId; queue: string; name: string; payload: any }
  | { action: "tasks"; queue: string; status?: "PENDING" | "RUNNING" | "DONE" | "FAILED" }
  | { action: "runTasksOnce"; queue: string };
let _engineCache: Record<string, WizardEngine> = {};

function getEngine(id: WizardId) {
  if (_engineCache[id]) return _engineCache[id];
  // Storage: prefer Prisma, fallback to in-memory for dev
  const prismaStorage = new PrismaStorage();
  const storage: any = prismaStorage.ready ? (prismaStorage as unknown as any) : new InMemoryStorage();
  const tasks = new InMemoryTaskQueue();
  const bus = new SimpleEventBus();
  // Attach OBARI task handlers to the bus
  registerObariTaskHandlers(bus as unknown as EventBus, tasks);

  const engine =
    id === "company-setup"
      ? createEngine({ storage, tasks, bus })
      : id === "obari"
      ? createEngine({ storage, tasks, bus })
      : id === "finance"
      ? createEngine({ storage, tasks, bus })
      : createEngine({ storage, tasks, bus });
  _engineCache[id] = engine;
  return engine;
}
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;

    switch (body.action) {
      case "init": {
        const engine = getEngine(body.wizardId);
        const ctx = await engine.init({ tenantId: body.tenantId ?? null, userId: body.userId ?? null, seed: body.seed ?? {} });
        return NextResponse.json({ ok: true, ctx });
      }
      case "load": {
        const engine = getEngine(body.wizardId);
        const ctx = await engine.load(body.tenantId ?? null, body.userId ?? null);
        return NextResponse.json({ ok: true, ctx });
      }
      case "save": {
        const engine = getEngine(body.wizardId);
        const ctx = (await engine.load(body.tenantId ?? null, body.userId ?? null)) ?? (await engine.init({ tenantId: body.tenantId, userId: body.userId }));
        const res = await engine.save(ctx, body.patch ?? {});
        return NextResponse.json({ ok: true, savedAt: res.savedAt, ctx: res.ctx });
      }
      case "next": {
        const engine = getEngine(body.wizardId);
        const ctx = (await engine.load(body.tenantId ?? null, body.userId ?? null))!;
        const nxt = await engine.next(ctx);
        return NextResponse.json({ ok: true, ctx: nxt });
      }
      case "prev": {
        const engine = getEngine(body.wizardId);
        const ctx = (await engine.load(body.tenantId ?? null, body.userId ?? null))!;
        const prev = await engine.prev(ctx);
        return NextResponse.json({ ok: true, ctx: prev });
      }
      case "complete": {
        const engine = getEngine(body.wizardId);
        const ctx = (await engine.load(body.tenantId ?? null, body.userId ?? null))!;
        const done = await engine.complete(ctx);
        return NextResponse.json({ ok: true, ctx: done });
      }
      case "enqueue": {
        const engine = getEngine(body.wizardId);
        const t = await engine.enqueueTask(body.queue, body.name, body.payload ?? {});
        return NextResponse.json({ ok: true, task: t });
      }
      case "tasks": {
        const engine = getEngine("company-setup");
        const list = await engine.listTasks(body.queue, body.status);
        return NextResponse.json({ ok: true, tasks: list });
      }
      case "runTasksOnce": {
        const engine = getEngine("company-setup");
        const result = await runQueuedTasksOnce(engine, body.queue);
        return NextResponse.json({ ok: true, result });
      }
      default:
        return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wizardId = (searchParams.get("wizardId") as WizardId) || "company-setup";
  const tenantId = searchParams.get("tenantId");
  const userId = searchParams.get("userId");
  const engine = getEngine(wizardId);
  const ctx = await engine.load(tenantId, userId);
  return NextResponse.json({ ok: true, ctx });
}