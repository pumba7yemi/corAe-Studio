// packages/automate-core/src/engine.ts
import type { Action, EngineResult, ExecutionContext } from "./type";

// Adapters are injected by the host app; for now, stub with console
export type Adapters = {
  messaging: { send: (payload: any) => Promise<any> };
  sheets: { appendRow: (payload: any) => Promise<any> };
  commerce: { adjustPrice: (payload: any) => Promise<any> };
  partners: {
    requestConfirmation: (payload: any) => Promise<any>;
    createOrder: (payload: any) => Promise<any>;
    advanceProcess?: (payload: any) => Promise<any>;
    requestVisit?: (payload: any) => Promise<any>;
  };
};

let adapters: Adapters = {
  messaging: { send: async (p) => (console.log("message:", p), { ok: true }) },
  sheets: { appendRow: async (p) => (console.log("sheet:", p), { ok: true }) },
  commerce: { adjustPrice: async (p) => (console.log("price:", p), { ok: true }) },
  partners: {
    requestConfirmation: async (p) => (console.log("partner.confirm:", p), { ok: true }),
    createOrder: async (p) => (console.log("partner.order:", p), { ok: true }),
  },
};

export const setAdapters = (a: Partial<Adapters>) => {
  adapters = { ...adapters, ...a } as Adapters;
};

const runAction = async (action: Action, _ctx: ExecutionContext) => {
  switch (action.type) {
    case "notify.message":
      return adapters.messaging.send(action.payload);
    case "sheet.appendRow":
      return adapters.sheets.appendRow(action.payload);
    case "catalog.adjustPrice":
      return adapters.commerce.adjustPrice(action.payload);
    case "partner.requestConfirmation":
      return adapters.partners.requestConfirmation(action.payload);
    case "partner.createOrder":
      return adapters.partners.createOrder(action.payload);
    case "process.advanceStage":
      return adapters.partners.advanceProcess?.(action.payload);
    case "process.requestVisit":
      return adapters.partners.requestVisit?.(action.payload);
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const runStep = async (ctx: ExecutionContext): Promise<EngineResult> => {
  const executed: Action[] = [];
  for (const action of ctx.step.actions) {
    await runAction(action, ctx);
    executed.push(action);
  }
  return { success: true, actionsRun: executed };
};