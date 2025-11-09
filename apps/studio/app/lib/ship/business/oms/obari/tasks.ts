// lib/obari/tasks.ts
import type { EventBus, WizardEngine } from "../../../../wizard/wizard";
import { InMemoryTaskQueue } from "../../../../wizard/wizard";

type Handler = (payload: any) => Promise<void>;

const handlers: Record<string, Handler> = {
  // Company/email
  CreateCompanyEmail: async (p) => {
    // TODO: call Gmail/Workspace admin API
    await sleep(150);
    console.log("Created company email", p);
  },
  // Tax
  RegisterVAT: async (p) => {
    await sleep(150);
    console.log("Started VAT registration", p);
  },
  // Docs
  GenerateTradeLicenseDraft: async (p) => {
    await sleep(150);
    console.log("Generated trade license draft", p);
  },
  // Finance
  SeedChartOfAccounts: async (p) => {
    await sleep(150);
    console.log("Seeded CoA", p);
  },
};

export function registerObariTaskHandlers(bus: EventBus, queue: InMemoryTaskQueue) {
  // Optionally react to events here
  bus.on("task:queued", (evt) => {
    // fire-and-forget processing hint (optional)
    // console.log("Queued:", evt.payload?.name);
  });
}

/**
 * Run queued tasks once (poll-style). You can wire a cron to call app/api/wizard with action=runTasksOnce.
 */
export async function runQueuedTasksOnce(engine: WizardEngine, queueName: string) {
  const items = await engine.listTasks(queueName, "PENDING");
  const results: Array<{ id: string; name: string; status: "DONE" | "FAILED" }> = [];
  for (const t of items) {
    t.status = "RUNNING";
    await engine.updateTask(t);
    try {
      const handler = handlers[t.name];
      if (!handler) throw new Error(`No handler for ${t.name}`);
      await handler(t.payload);
      t.status = "DONE";
      await engine.updateTask(t);
      results.push({ id: t.id, name: t.name, status: "DONE" });
    } catch (e: any) {
      t.status = "FAILED";
      t.error = e?.message ?? String(e);
      await engine.updateTask(t);
      results.push({ id: t.id, name: t.name, status: "FAILED" });
    }
  }
  return { processed: results.length, results };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}