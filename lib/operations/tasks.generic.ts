// corAe Operations Generic Task Handlers
// Reusable automation set: notifications, acceptance reminders, reporting.

import type { EventBus, WizardEngine } from "@/lib/wizard/wizard";

type Handler = (payload: any) => Promise<void>;

const handlers: Record<string, Handler> = {
  NotifyAssignment: async (p) => {
    await sleep(100);
    console.log("[Notify] Assignment sent:", p);
  },
  ReminderAcceptance: async (p) => {
    await sleep(100);
    console.log("[Reminder] Acceptance pending:", p);
  },
  PushReport: async (p) => {
    await sleep(150);
    console.log("[Reporting] Data pushed to dashboard:", p);
  },
};

// single shared sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export function registerOperationsGenericHandlers(bus: EventBus) {
  bus.on("task:queued", (evt) => {
    // log or trigger background runner
  });
}

export async function runOperationsGenericTasksOnce(
  engine: WizardEngine,
  queueName: string
) {
  const items = await engine.listTasks(queueName, "PENDING");
  const results: any[] = [];

  for (const t of items) {
    t.status = "RUNNING";
    await engine.updateTask(t);

    try {
      const fn = handlers[t.name];
      if (!fn) throw new Error(`No handler for ${t.name}`);

      await fn(t.payload);

      t.status = "DONE";
      await engine.updateTask(t);

      results.push({ id: (t as any).id, status: t.status });
    } catch (err) {
      // mark failed and continue with next task
      t.status = "FAILED";
      await engine.updateTask(t);
      results.push({ id: (t as any).id, status: t.status, error: (err as Error).message });
    }
  }

  return results;
}

