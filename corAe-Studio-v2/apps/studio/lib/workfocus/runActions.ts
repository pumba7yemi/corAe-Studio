import type { Action } from "./types";
import { sendCIMS } from "@/lib/cims/notify";

/**
 * Execute WorkFocus actions.
 * - notify  -> CIMS
 * - task    -> log (swap with your task system)
 * - learn   -> log (KB deep link)
 * - run     -> log (internal runner)
 * - webhook -> real HTTP call (GET/POST/etc)
 */
export async function runActions(actions: Action[]) {
  for (const a of actions) {
    try {
      if (a.type === "notify") {
        await sendCIMS(a.ref, a.payload ?? {});
      } else if (a.type === "task") {
        console.log("TASK:", a.ref, a.payload ?? {});
      } else if (a.type === "learn") {
        console.log("LEARN:", a.ref);
      } else if (a.type === "run") {
        console.log("RUN:", a.ref, a.payload ?? {});
      } else if (a.type === "webhook") {
        await callWebhook(a.ref, a.payload);
      }
    } catch (e) {
      console.warn("Action failed:", a, e);
    }
  }
}

/** Supports refs like "GET:/api/finance/pnl" or "POST:/api/finance/sales" */
async function callWebhook(ref: string, payload?: Record<string, any>) {
  const m = ref.match(/^(GET|POST|PUT|PATCH|DELETE):(.+)$/i);
  if (!m) {
    console.warn("Invalid webhook ref:", ref);
    return;
  }
  const method = m[1].toUpperCase();
  const url = m[2].trim();

  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(payload ?? {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn("Webhook failed:", { ref, status: res.status, text });
  } else {
    // Optional: log compact response for debugging
    try {
      const data = await res.json();
      console.log("Webhook OK:", ref, Array.isArray(data) ? data.length : Object.keys(data || {}).length);
    } catch {
      console.log("Webhook OK (no JSON):", ref);
    }
  }
}
