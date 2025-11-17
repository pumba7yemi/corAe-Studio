/* eslint-disable no-console */
// corAe Wizard Engine — single-file core
// Purpose:
// - One engine to power all wizards (Company Setup, OBARI, Finance, etc.)
// - Strong typing for steps, guards, actions, effects
// - Pluggable storage, task queue (“bin”), and event bus
// - Save/Resume drafts + versioning
// - Open-edit friendly: swap adapters without touching pages

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type StepId = string;
export type WizardId = "company-setup" | "obari" | "finance" | string;

export interface WizardContext {
  wizardId: WizardId;
  tenantId?: string | null;
  userId?: string | null;
  // Arbitrary payload (wizard state object)
  state: Record<string, any>;
  // Meta
  version: number;
  currentStep: StepId;
  createdAt: string;
  updatedAt: string;
}

export type GuardFn = (ctx: WizardContext) => boolean | Promise<boolean>;
export type ValidateFn = (ctx: WizardContext) => {
  ok: boolean;
  errors?: Record<string, string>;
};
export type EffectFn = (ctx: WizardContext) => Promise<WizardContext> | WizardContext;

export interface StepDef {
  id: StepId;
  title?: string;
  description?: string;
  // Transition map (explicit) OR a next() resolver
  next?: StepId | ((ctx: WizardContext) => StepId);
  prev?: StepId | ((ctx: WizardContext) => StepId);
  // Optional guard (can we enter this step?)
  guard?: GuardFn;
  // Validate -> called before moving forward from this step
  validate?: ValidateFn;
  // Side-effects when entering/leaving
  onEnter?: EffectFn;
  onExit?: EffectFn;
}

export interface WizardDef {
  id: WizardId;
  version: number;
  steps: StepDef[];
  firstStep: StepId;
  // Optional: run when wizard completes
  onComplete?: EffectFn;
}

export interface SaveResult {
  savedAt: string;
  ctx: WizardContext;
}

export interface LoadResult {
  ctx: WizardContext | null;
}

export interface StorageAdapter {
  save(ctx: WizardContext): Promise<SaveResult>;
  load(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<LoadResult>;
  clear?(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<void>;
}

export type TaskId = string;
export type TaskStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface Task {
  id: TaskId;
  queue: string; // e.g., "obari-bin", "finance-bin", "email"
  name: string;  // e.g., "CreateTradeLicenseDraft"
  payload: Record<string, any>;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  error?: string;
}

export interface TaskAdapter {
  enqueue(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  list(queue: string, status?: TaskStatus): Promise<Task[]>;
}

export interface Event {
  type: string; // e.g., "wizard:saved", "task:done"
  payload?: any;
  ts: string;
}

export interface EventBus {
  emit(evt: Event): void;
  on(type: string, handler: (evt: Event) => void): () => void;
}

// ────────────────────────────────────────────────────────────────────────────
/** InMemoryStorage (default for OSS/local dev). Swap with DB in prod. */
// ────────────────────────────────────────────────────────────────────────────

export class InMemoryStorage implements StorageAdapter {
  private store = new Map<string, WizardContext>();

  private key(id: WizardId, tenantId?: string | null, userId?: string | null) {
    return `${id}::${tenantId ?? "tenant"}::${userId ?? "user"}`;
  }

  async save(ctx: WizardContext): Promise<SaveResult> {
    ctx.updatedAt = new Date().toISOString();
    this.store.set(this.key(ctx.wizardId, ctx.tenantId, ctx.userId), ctx);
    return { savedAt: ctx.updatedAt, ctx };
  }

  async load(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<LoadResult> {
    const ctx = this.store.get(this.key(wizardId, tenantId, userId)) ?? null;
    return { ctx };
  }

  async clear(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<void> {
    this.store.delete(this.key(wizardId, tenantId, userId));
  }
}

// ────────────────────────────────────────────────────────────────────────────
/** LocalStorageStorage (browser). Useful for Save & Continue. */
// ────────────────────────────────────────────────────────────────────────────

export class LocalStorageStorage implements StorageAdapter {
  constructor(private keyPrefix = "corAeWizard") {}

  private key(id: WizardId, tenantId?: string | null, userId?: string | null) {
    return `${this.keyPrefix}::${id}::${tenantId ?? "tenant"}::${userId ?? "user"}`;
  }

  async save(ctx: WizardContext): Promise<SaveResult> {
    const updatedAt = new Date().toISOString();
    const payload = { ...ctx, updatedAt };
    if (typeof window !== "undefined") {
      localStorage.setItem(this.key(ctx.wizardId, ctx.tenantId, ctx.userId), JSON.stringify(payload));
    }
    return { savedAt: updatedAt, ctx: payload };
  }

  async load(wizardId: WizardId, tenantId?: string | null, userId?: string | null): Promise<LoadResult> {
    if (typeof window === "undefined") return { ctx: null };
    const raw = localStorage.getItem(this.key(wizardId, tenantId, userId));
    if (!raw) return { ctx: null };
    try {
      const ctx = JSON.parse(raw) as WizardContext;
      return { ctx };
    } catch {
      return { ctx: null };
    }
  }

  async clear(wizardId: WizardId, tenantId?: string | null, userId?: string | null) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.key(wizardId, tenantId, userId));
  }
}

// ────────────────────────────────────────────────────────────────────────────
/** InMemoryTaskQueue (the “bin”). */
// ────────────────────────────────────────────────────────────────────────────

export class InMemoryTaskQueue implements TaskAdapter {
  private tasks = new Map<string, Task>();

  async enqueue(task: Task): Promise<Task> {
    const now = new Date().toISOString();
    const t: Task = {
      ...task,
      id: task.id || `task_${Math.random().toString(36).slice(2, 10)}`,
      status: "PENDING",
      createdAt: now,
      updatedAt: now,
      attempts: 0,
    };
    this.tasks.set(t.id, t);
    return t;
  }

  async update(task: Task): Promise<Task> {
    task.updatedAt = new Date().toISOString();
    this.tasks.set(task.id, task);
    return task;
  }

  async list(queue: string, status?: TaskStatus): Promise<Task[]> {
    const out: Task[] = [];
    for (const t of this.tasks.values()) {
      if (t.queue !== queue) continue;
      if (status && t.status !== status) continue;
      out.push(t);
    }
    return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
}

// ────────────────────────────────────────────────────────────────────────────
/** Simple EventBus */
// ────────────────────────────────────────────────────────────────────────────

export class SimpleEventBus implements EventBus {
  private handlers = new Map<string, Set<(evt: Event) => void>>();

  emit(evt: Event): void {
    const set = this.handlers.get(evt.type);
    if (!set) return;
    for (const h of set) {
      try {
        h(evt);
      } catch (e) {
        console.error("Event handler error", e);
      }
    }
  }

  on(type: string, handler: (evt: Event) => void): () => void {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler);
    this.handlers.set(type, set);
    return () => set.delete(handler);
  }
}

// ────────────────────────────────────────────────────────────────────────────
/** WizardEngine */
// ────────────────────────────────────────────────────────────────────────────

export class WizardEngine {
  readonly def: WizardDef;
  private storage: StorageAdapter;
  private tasks: TaskAdapter;
  private bus: EventBus;

  constructor(opts: {
    def: WizardDef;
    storage?: StorageAdapter;
    tasks?: TaskAdapter;
    bus?: EventBus;
  }) {
    this.def = opts.def;
    this.storage = opts.storage ?? new InMemoryStorage();
    this.tasks = opts.tasks ?? new InMemoryTaskQueue();
    this.bus = opts.bus ?? new SimpleEventBus();
  }

  // Initialize a new context or migrate a loaded one to latest version
  async init(params: {
    tenantId?: string | null;
    userId?: string | null;
    seed?: Record<string, any>;
  }): Promise<WizardContext> {
    const now = new Date().toISOString();
    const ctx: WizardContext = {
      wizardId: this.def.id,
      tenantId: params.tenantId ?? null,
      userId: params.userId ?? null,
      version: this.def.version,
      state: params.seed ?? {},
      currentStep: this.def.firstStep,
      createdAt: now,
      updatedAt: now,
    };
    await this.storage.save(ctx);
    this.bus.emit({ type: "wizard:initialized", payload: ctx, ts: now });
    return ctx;
  }

  async load(tenantId?: string | null, userId?: string | null): Promise<WizardContext | null> {
    const { ctx } = await this.storage.load(this.def.id, tenantId, userId);
    if (!ctx) return null;
    // Migration hook (bump version)
    if (ctx.version !== this.def.version) {
      ctx.version = this.def.version;
      ctx.updatedAt = new Date().toISOString();
      await this.storage.save(ctx);
      this.bus.emit({ type: "wizard:migrated", payload: ctx, ts: ctx.updatedAt });
    }
    return ctx;
  }

  // Save partial state (draft)
  async save(ctx: WizardContext, patch: Partial<WizardContext["state"]>): Promise<SaveResult> {
    const merged = { ...ctx, state: { ...ctx.state, ...patch } } as WizardContext;
    const res = await this.storage.save(merged);
    this.bus.emit({ type: "wizard:saved", payload: res.ctx, ts: res.savedAt });
    return res;
    }

  // Move to next step (validates current)
  async next(ctx: WizardContext): Promise<WizardContext> {
    const current = this.getStep(ctx.currentStep);
    if (current.validate) {
      const result = current.validate(ctx);
      if (!result.ok) {
        throw new Error("Validation failed: " + JSON.stringify(result.errors ?? {}));
      }
    }
    if (current.onExit) ctx = await current.onExit(ctx);

    const nextId = typeof current.next === "function" ? current.next(ctx) : current.next ?? this.defaultNextOf(ctx.currentStep);
    const target = this.getStep(nextId);

    if (target.guard) {
      const allowed = await target.guard(ctx);
      if (!allowed) throw new Error(`Guard blocked entry to step "${nextId}"`);
    }
    if (target.onEnter) ctx = await target.onEnter(ctx);

    ctx.currentStep = target.id;
    const { ctx: saved } = await this.storage.save(ctx);
    this.bus.emit({ type: "wizard:step", payload: { from: current.id, to: target.id, ctx: saved }, ts: saved.updatedAt });
    return saved;
  }

  // Move to previous step (no validation)
  async prev(ctx: WizardContext): Promise<WizardContext> {
    const current = this.getStep(ctx.currentStep);
    if (current.onExit) ctx = await current.onExit(ctx);

    const prevId = typeof current.prev === "function" ? current.prev(ctx) : current.prev ?? this.defaultPrevOf(ctx.currentStep);
    const target = this.getStep(prevId);

    if (target.onEnter) ctx = await target.onEnter(ctx);

    ctx.currentStep = target.id;
    const { ctx: saved } = await this.storage.save(ctx);
    this.bus.emit({ type: "wizard:step", payload: { from: current.id, to: target.id, ctx: saved }, ts: saved.updatedAt });
    return saved;
  }

  // Complete wizard (runs onComplete + clears draft)
  async complete(ctx: WizardContext): Promise<WizardContext> {
    if (this.def.onComplete) {
      ctx = await this.def.onComplete(ctx);
    }
    await this.storage.clear?.(this.def.id, ctx.tenantId, ctx.userId);
    this.bus.emit({ type: "wizard:completed", payload: ctx, ts: new Date().toISOString() });
    return ctx;
  }

  // Task bin API (OBARI/Finance automations drop-in)
  async enqueueTask(queue: string, name: string, payload: Record<string, any>): Promise<Task> {
    const task: Task = {
      id: "",
      queue,
      name,
      payload,
      status: "PENDING",
      createdAt: "",
      updatedAt: "",
      attempts: 0,
    };
    const t = await this.tasks.enqueue(task);
    this.bus.emit({ type: "task:queued", payload: t, ts: t.createdAt });
    return t;
  }

  async listTasks(queue: string, status?: TaskStatus) {
    return this.tasks.list(queue, status);
  }

  async updateTask(t: Task) {
    const u = await this.tasks.update(t);
    const evtType = t.status === "DONE" ? "task:done" : t.status === "FAILED" ? "task:failed" : "task:updated";
    this.bus.emit({ type: evtType, payload: u, ts: u.updatedAt });
    return u;
  }

  on(type: string, handler: (evt: Event) => void) {
    return this.bus.on(type, handler);
  }

  // ─────────────── Helpers ───────────────

  private getStep(id: StepId): StepDef {
    const step = this.def.steps.find(s => s.id === id);
    if (!step) throw new Error(`Step "${id}" not found in wizard "${this.def.id}"`);
    return step;
  }

  private defaultNextOf(current: StepId): StepId {
    const idx = this.def.steps.findIndex(s => s.id === current);
    if (idx < 0 || idx === this.def.steps.length - 1) return current;
    return this.def.steps[idx + 1].id;
  }

  private defaultPrevOf(current: StepId): StepId {
    const idx = this.def.steps.findIndex(s => s.id === current);
    if (idx <= 0) return current;
    return this.def.steps[idx - 1].id;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Example wizard definitions (ready to use / extend)
// ────────────────────────────────────────────────────────────────────────────

// 1) Company Setup (matches your single-page UI)
export const CompanySetupWizard: WizardDef = {
  id: "company-setup",
  version: 1,
  firstStep: "SIGN_IN",
  steps: [
    {
      id: "SIGN_IN",
      title: "Sign in",
      validate: (ctx) => ({
        ok: !!ctx.state.emailVerified,
        errors: !ctx.state.emailVerified ? { email: "Email must be verified" } : undefined,
      }),
    },
    {
      id: "COMPANY_NAME",
      title: "Company name",
      validate: (ctx) => {
        const ok = !!ctx.state.isCompanyEmail || ctx.state.hasCompanyName !== null;
        return { ok, errors: ok ? undefined : { name: "Choose company email or provide name" } };
      },
    },
    {
      id: "EMAIL_DOMAIN",
      title: "Email & Domain",
      validate: (ctx) => {
        const domainPath = ctx.state.hasDomain === true;
        const ok = domainPath ? !!ctx.state.domainVerified : !!ctx.state.emailVerified;
        return { ok, errors: ok ? undefined : { domain: "Verify domain or email first" } };
      },
    },
    {
      id: "JURISDICTION",
      title: "Jurisdiction",
      validate: (ctx) => ({ ok: !!ctx.state.jurisdiction, errors: { jurisdiction: "Select jurisdiction" } }),
    },
    {
      id: "LEGAL_TYPE",
      title: "Legal Type",
      validate: (ctx) => ({ ok: !!ctx.state.legalType, errors: { legalType: "Select legal type" } }),
    },
    {
      id: "BUSINESS_ACTIVITY",
      title: "Business Activity",
      validate: (ctx) => {
        const ok = (ctx.state.businessDescription?.trim()?.length ?? 0) >= 10 && (ctx.state.activityCodes?.length ?? 0) > 0;
        return { ok, errors: ok ? undefined : { activity: "Add description and select at least one activity code" } };
      },
    },
    {
      id: "OWNERS",
      title: "Owners",
      validate: (ctx) => {
        const owners = (ctx.state.owners ?? []) as Array<{ fullName: string; email: string; pct: number }>;
        const total = owners.reduce((a, o) => a + (Number.isFinite(o.pct) ? o.pct : 0), 0);
        const ok = Math.round(total) === 100 && owners.length > 0 && owners.every(o => o.fullName && o.email);
        return { ok, errors: ok ? undefined : { owners: "Owners must total 100% and include name & email" } };
      },
    },
    {
      id: "TAX",
      title: "Tax",
      validate: (ctx) => {
        const ok = !!ctx.state.trn || !!ctx.state.corpTaxRegistered || ctx.state.expectTurnover !== null;
        return { ok, errors: ok ? undefined : { tax: "Provide TRN or start corporate tax or estimate turnover" } };
      },
    },
    {
      id: "BANKING",
      title: "Banking",
      validate: (ctx) => {
        if (ctx.state.hasBank === null) return { ok: false, errors: { bank: "Choose banking path" } };
        if (ctx.state.hasBank === false) return { ok: true };
        const ok = !!ctx.state.bankChoice && !!ctx.state.iban;
        return { ok, errors: ok ? undefined : { bank: "Provide bank and IBAN" } };
      },
    },
    { id: "SUMMARY", title: "Summary" },
  ],
  onComplete: async (ctx) => {
    // Example: enqueue bootstrap tasks for OBARI/FileLogic/HR/CIMS
    // Hooked externally via engine.enqueueTask(...)
    return ctx;
  },
};

// 2) OBARI Wizard (Back Office Runtime Intake) — skeleton
export const ObariWizard: WizardDef = {
  id: "obari",
  version: 1,
  firstStep: "ORDER_INTAKE",
  steps: [
    {
      id: "ORDER_INTAKE",
      title: "OBARI Order Intake",
      description: "Capture the work order from front-office (company setup, tax, email, etc.).",
      validate: (ctx) => ({ ok: !!ctx.state.orderId, errors: { orderId: "Order ID required" } }),
      onExit: async (ctx) => {
        // Example: create a processing task in OBARI queue
        // (Engine instance will call enqueueTask from page/service)
        return ctx;
      },
    },
    {
      id: "TASK_BIN",
      title: "Automation Bin",
      description: "Configure automated tasks: create email, register tax, generate docs.",
      validate: (ctx) => ({ ok: true }),
    },
    {
      id: "OPERATIONS_LA",
      title: "Operations Lifecycle",
      description: "Track work-in-progress parallel to day-to-day operations.",
      validate: (ctx) => ({ ok: true }),
    },
    { id: "SUMMARY", title: "Summary" },
  ],
};

// 3) Finance Wizard — skeleton
export const FinanceWizard: WizardDef = {
  id: "finance",
  version: 1,
  firstStep: "FOUNDATION",
  steps: [
    {
      id: "FOUNDATION",
      title: "Finance Foundation",
      description: "Pick accounting basis, base currency, tax region, and FY start.",
      validate: (ctx) => {
        const ok = !!ctx.state.currency && !!ctx.state.fyStart && !!ctx.state.taxRegion;
        return { ok, errors: ok ? undefined : { finance: "Currency, FY start, and tax region required" } };
      },
    },
    {
      id: "CHART_OF_ACCOUNTS",
      title: "Chart of Accounts",
      description: "Seed a CoA based on business activity, with edit options.",
      validate: (ctx) => ({ ok: !!ctx.state.coaSeeded }),
    },
    {
      id: "BANK_FEEDS",
      title: "Bank Feeds",
      description: "Connect bank feeds or upload statements for OBARI reconciliation.",
      validate: (ctx) => ({ ok: !!ctx.state.bankConnected || !!ctx.state.statementUploaded }),
    },
    { id: "SUMMARY", title: "Summary" },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Factory helpers (to instantiate engines quickly)
// ────────────────────────────────────────────────────────────────────────────

export function createCompanySetupEngine(opts?: {
  storage?: StorageAdapter;
  tasks?: TaskAdapter;
  bus?: EventBus;
}) {
  return new WizardEngine({
    def: CompanySetupWizard,
    storage: opts?.storage,
    tasks: opts?.tasks,
    bus: opts?.bus,
  });
}

export function createObariEngine(opts?: {
  storage?: StorageAdapter;
  tasks?: TaskAdapter;
  bus?: EventBus;
}) {
  return new WizardEngine({
    def: ObariWizard,
    storage: opts?.storage,
    tasks: opts?.tasks,
    bus: opts?.bus,
  });
}

export function createFinanceEngine(opts?: {
  storage?: StorageAdapter;
  tasks?: TaskAdapter;
  bus?: EventBus;
}) {
  return new WizardEngine({
    def: FinanceWizard,
    storage: opts?.storage,
    tasks: opts?.tasks,
    bus: opts?.bus,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Usage sketch (UI layer calls these):
// ────────────────────────────────────────────────────────────────────────────
//
// const engine = createCompanySetupEngine({ storage: new LocalStorageStorage() });
// const ctx = (await engine.load(tenantId, userId)) ?? await engine.init({ tenantId, userId, seed: { emailVerified: false } });
// await engine.save(ctx, { emailVerified: true, email: "info@company.com" });
// const ctxNext = await engine.next(ctx); // runs validation & onExit/onEnter
//
// // Enqueue OBARI tasks when ready (from SUMMARY or onComplete):
// await engine.enqueueTask("obari-bin", "CreateTradeLicenseDraft", { tenantId, companyName: ctx.state.companyName });
//
// // Subscribe to events:
// const off = engine.on("task:done", (evt) => console.log("Task done", evt.payload));
//
// ────────────────────────────────────────────────────────────────────────────