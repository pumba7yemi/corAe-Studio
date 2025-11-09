// HR bridge – called during/after wizard submit
import type { FirstTradeState } from "@/packages/workfocus-core/wizard/first-trade.schema";

export async function ensureHrFileAndQuota(state: FirstTradeState) {
  // If new company, spin up labour file & visa quota; if established, import and validate
  const mode = state.mode;
  if (mode === "new") {
    // TODO: call jurisdiction adapter to open labour file, set initial quota
    return { created: true, slots: 2 };
  }
  // established
  // TODO: verify existing HR file; import staff CSV; create expiry reminders
  return { imported: true };
}

export async function registerOwnerLedRoles(state: FirstTradeState) {
  // Persist foundation roles as Owner-led with AI placeholders
  const entries = Object.entries(state.roles).map(([k, v]) => ({ role: k, ownerLed: v.ownerLed, ai: v.aiAgent }));
  // TODO: write to HR role registry
  return { count: entries.length };
}