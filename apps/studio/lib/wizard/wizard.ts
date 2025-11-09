// apps/studio/lib/wizard/wizard.ts
/**
 * corAe • Wizard Engine (Home/Work/Business)
 * -------------------------------------------------
 * A tiny, dependency-free orchestration core used by onboarding wizards
 * and API routes (seeders). Provides:
 *  - InMemoryStorage: simple key/value + collections
 *  - InMemoryTaskQueue: enqueue + drain tasks per "bin"
 *  - SimpleEventBus: subscribe/emit for domain events
 *  - WizardEngine: high-level facade (enqueueTask, process, snapshot)
 *  - createHomeEngine / createWorkEngine factories
 *
 * NOTE: This is intentionally lightweight so you can swap storage/queue later
 * for Prisma/Redis/SQS without touching wizard pages.
 */

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

export type Task = {
  id: string;
  bin: string;              // e.g., "home-bin", "work-bin"
  type: string;             // e.g., "RegisterRoutine"
  payload: Json;
  createdAt: string;
  status: "PENDING" | "DONE" | "FAILED";
  error?: string;
};

export interface Storage {
  get<T = any>(key: string): Promise<T | undefined>;
  set<T = any>(key: string, value: T): Promise<void>;
  push<T = any>(key: string, value: T): Promise<void>;
  all<T = any>(key: string): Promise<T[]>;
  upsertInCollection<T extends { id: string }>(key: string, item: T): Promise<void>;
}

export interface TaskQueue {
  enqueue(task: Task): Promise<void>;
  next(bin: string): Promise<Task | undefined>;
  markDone(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
  list(bin: string): Promise<Task[]>;
}

export interface EventBus {
  subscribe(event: string, handler: (data: any) => void): () => void;
  emit(event: string, data: any): void;
}

export interface WizardEngine {
  enqueueTask(bin: string, type: string, payload: Json): Promise<Task>;
  processNext(bin: string): Promise<Task | undefined>;
  processAll(bin: string, max?: number): Promise<number>;
  snapshot(): Promise<WizardSnapshot>;
  on(event: string, handler: (data: any) => void): () => void;

  // domain helpers (no-ops by default; factories can enhance)
  handlers: Record<string, (task: Task, ctx: EngineCtx) => Promise<void>>;
  ctx: EngineCtx;
}

export type EngineCtx = {
  storage: Storage;
  tasks: TaskQueue;
  bus: EventBus;
  now(): string;
};

export type WizardSnapshot = {
  storageKeys: string[];
  bins: Record<string, { pending: number; total: number }>;
};

/* ───────────────────────── In-memory adapters ───────────────────────── */

export class InMemoryStorage implements Storage {
  private map = new Map<string, any>();

  async get<T = any>(key: string): Promise<T | undefined> {
    return this.map.get(key);
  }
  async set<T = any>(key: string, value: T): Promise<void> {
    this.map.set(key, value);
  }
  async push<T = any>(key: string, value: T): Promise<void> {
    const list = (this.map.get(key) as T[]) ?? [];
    list.push(value);
    this.map.set(key, list);
  }
  async all<T = any>(key: string): Promise<T[]> {
    return (this.map.get(key) as T[]) ?? [];
  }
  async upsertInCollection<T extends { id: string }>(key: string, item: T): Promise<void> {
    const list = ((this.map.get(key) as T[]) ?? []).slice();
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    this.map.set(key, list);
  }

  keys(): string[] {
    return Array.from(this.map.keys());
  }
}

export class InMemoryTaskQueue implements TaskQueue {
  private byBin = new Map<string, Task[]>();
  private byId = new Map<string, Task>();

  async enqueue(task: Task): Promise<void> {
    const list = this.byBin.get(task.bin) ?? [];
    list.push(task);
    this.byBin.set(task.bin, list);
    this.byId.set(task.id, task);
  }
  async next(bin: string): Promise<Task | undefined> {
    const list = this.byBin.get(bin) ?? [];
    return list.find((t) => t.status === "PENDING");
  }
  async markDone(id: string): Promise<void> {
    const t = this.byId.get(id);
    if (t) t.status = "DONE";
  }
  async markFailed(id: string, error: string): Promise<void> {
    const t = this.byId.get(id);
    if (t) {
      t.status = "FAILED";
      t.error = error;
    }
  }
  async list(bin: string): Promise<Task[]> {
    return (this.byBin.get(bin) ?? []).slice();
  }

  bins(): string[] {
    return Array.from(this.byBin.keys());
  }
}

export class SimpleEventBus implements EventBus {
  private handlers = new Map<string, Set<(data: any) => void>>();

  subscribe(event: string, handler: (data: any) => void): () => void {
    const set = this.handlers.get(event) ?? new Set();
    set.add(handler);
    this.handlers.set(event, set);
    return () => set.delete(handler);
  }
  emit(event: string, data: any): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const h of set) h(data);
  }
}

/* ───────────────────────── Utilities ───────────────────────── */

function rid(prefix = "t"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_` + Math.random().toString(36).slice(2, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

/* ───────────────────────── Core engine ───────────────────────── */

export function createEngine(ctx: EngineCtx, handlers?: WizardEngine["handlers"]): WizardEngine {
  const engine: WizardEngine = {
    ctx,
    handlers: handlers ?? {},
    async enqueueTask(bin, type, payload) {
      const task: Task = {
        id: rid("task"),
        bin,
        type,
        payload,
        createdAt: ctx.now(),
        status: "PENDING",
      };
      await ctx.tasks.enqueue(task);
      ctx.bus.emit("task.enqueued", { bin, type, id: task.id });
      return task;
    },
    async processNext(bin) {
      const task = await ctx.tasks.next(bin);
      if (!task) return undefined;

      const handler = engine.handlers[task.type];
      if (!handler) {
        await ctx.tasks.markFailed(task.id, `No handler for type ${task.type}`);
        ctx.bus.emit("task.failed", { id: task.id, type: task.type, reason: "NO_HANDLER" });
        return task;
      }

      try {
        await handler(task, engine.ctx);
        await ctx.tasks.markDone(task.id);
        ctx.bus.emit("task.done", { id: task.id, type: task.type });
      } catch (e: any) {
        await ctx.tasks.markFailed(task.id, e?.message ?? String(e));
        ctx.bus.emit("task.failed", { id: task.id, type: task.type, error: e?.message ?? String(e) });
      }
      return task;
    },
    async processAll(bin, max = 100) {
      let n = 0;
      // Prevent infinite loop if handlers re-enqueue
      while (n < max) {
        const next = await ctx.tasks.next(bin);
        if (!next) break;
        await engine.processNext(bin);
        n++;
      }
      return n;
    },
    async snapshot() {
      const storageKeys = (ctx.storage instanceof InMemoryStorage) ? ctx.storage.keys() : [];
      const bins: Record<string, { pending: number; total: number }> = {};
      const q = ctx.tasks as InMemoryTaskQueue;
      for (const bin of q.bins()) {
        const list = await q.list(bin);
        bins[bin] = {
          pending: list.filter((t) => t.status === "PENDING").length,
          total: list.length,
        };
      }
      return { storageKeys, bins };
    },
    on(event, handler) {
      return ctx.bus.subscribe(event, handler);
    },
  };

  return engine;
}

/* ───────────────────────── Domain factories ───────────────────────── */

export function createHomeEngine(opts: {
  storage: Storage;
  tasks: TaskQueue;
  bus: EventBus;
}): WizardEngine {
  const handlers: WizardEngine["handlers"] = {
    // Registers a space (area/room) into storage collection "home.spaces"
    async RegisterSpace(task, ctx) {
      const payload = task.payload as { id: string; name: string };
      await ctx.storage.upsertInCollection("home.spaces", {
        id: payload.id,
        name: payload.name,
        updatedAt: ctx.now(),
      });
      ctx.bus.emit("home.space.registered", payload);
    },

    // Registers a routine into "home.routines"
    async RegisterRoutine(task, ctx) {
      const r = task.payload as {
        id: string; title: string; frequency: string; when?: string; spaceId?: string; checklist: string[];
      };
      await ctx.storage.upsertInCollection("home.routines", {
        ...r,
        updatedAt: ctx.now(),
      });
      ctx.bus.emit("home.routine.registered", r);
    },

    // Assign routine to member
    async NotifyRoutineAssign(task, ctx) {
      const { routineId, memberId } = task.payload as { routineId: string; memberId: string };
      await ctx.storage.push("home.assignments", { routineId, memberId, ts: ctx.now() });
      ctx.bus.emit("home.routine.assigned", { routineId, memberId });
    },

    // Mark routine acknowledged (e.g., user accepted)
    async MarkRoutineAcknowledged(task, ctx) {
      const { routineId, ts } = task.payload as { routineId: string; ts: string };
      await ctx.storage.push("home.ack", { routineId, ts });
      ctx.bus.emit("home.routine.ack", { routineId, ts });
    },
  };

  return createEngine(
    {
      storage: opts.storage,
      tasks: opts.tasks,
      bus: opts.bus,
      now: nowIso,
    },
    handlers
  );
}

export function createWorkEngine(opts: {
  storage: Storage;
  tasks: TaskQueue;
  bus: EventBus;
}): WizardEngine {
  const handlers: WizardEngine["handlers"] = {
    async RegisterDepartment(task, ctx) {
      const d = task.payload as { id: string; name: string; description?: string };
      await ctx.storage.upsertInCollection("work.departments", { ...d, updatedAt: ctx.now() });
      ctx.bus.emit("work.department.registered", d);
    },
    async RegisterPartner(task, ctx) {
      const p = task.payload as { id: string; role: string; contact?: string; isExternal?: boolean; departmentId?: string };
      await ctx.storage.upsertInCollection("work.partners", { ...p, updatedAt: ctx.now() });
      ctx.bus.emit("work.partner.registered", p);
    },
    async RegisterWorkItem(task, ctx) {
      const w = task.payload as { id: string; name: string; fields: string[] };
      await ctx.storage.upsertInCollection("work.items", { ...w, updatedAt: ctx.now() });
      ctx.bus.emit("work.item.registered", w);
    },
    async RegisterChecklist(task, ctx) {
      const c = task.payload as { workItemId: string; title: string; items: string[] };
      await ctx.storage.push("work.checklists", { ...c, id: rid("chk"), updatedAt: ctx.now() });
      ctx.bus.emit("work.checklist.registered", c);
    },
  };

  return createEngine(
    {
      storage: opts.storage,
      tasks: opts.tasks,
      bus: opts.bus,
      now: nowIso,
    },
    handlers
  );
}

/* ───────────────────────── Convenience exports ───────────────────────── */

export const WizardAdapters = {
  InMemoryStorage,
  InMemoryTaskQueue,
  SimpleEventBus,
};

export type { Task as WizardTask };

// Convenience aliases used by some API routes/pages that expect domain-specific
// factory functions. They can point to the same lightweight engines here.
export function createFinanceEngine(opts: { storage: Storage; tasks: TaskQueue; bus: EventBus; }) {
  return createWorkEngine(opts);
}

export function createObariEngine(opts: { storage: Storage; tasks: TaskQueue; bus: EventBus; }) {
  return createWorkEngine(opts);
}

// Default export with the primary factory for modules that import the whole
// wizard module as a single object.
const WizardModule = {
  createEngine,
  createHomeEngine,
  createWorkEngine,
  createFinanceEngine,
  createObariEngine,
  WizardAdapters,
};

export default WizardModule;