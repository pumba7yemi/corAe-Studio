// Automate hooks – wire these into your scheduler/queue system
import type { FirstTradeState } from "@/packages/workfocus-core/wizard/first-trade.schema";

export async function scheduleSetupObari(state: FirstTradeState) {
  // TODO: create tasks for licence, VAT, bank, lease (new mode)
  // or create renewal reminders (established mode)
  return { ok: true };
}

export async function convertDealsToBDOs(state: FirstTradeState) {
  // TODO: take firstDeal / importedDeals and create standing orders (BDOs)
  return { created: (state.deals.importedDeals?.length ?? 0) + (state.deals.firstDeal ? 1 : 0) };
}

export async function kickOffFinancePipelines(state: FirstTradeState) {
  // TODO: connect invoicing, reconciliation, and anomaly detection
  return { ok: true };
}