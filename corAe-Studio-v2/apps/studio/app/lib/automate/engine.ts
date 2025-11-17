// app/lib/automate/engine.ts
import type { Action, Adapters, EngineResult, ExecutionContext } from "./types";
import * as Guards from "./guards";
import * as Market from "./market";
import { getAdapters } from "./registry";

const runAction = async (adapters: Adapters, action: Action, _ctx: ExecutionContext) => {
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
  const notes: string[] = [];
  const adapters = getAdapters(ctx.workflow.tenantId);

  // +1% policy (can be relaxed by host by swapping fetchSnapshot)
  const marketOk = await Market.ensurePlusOne(ctx).catch(() => true);
  if (!marketOk) {
    notes.push("+1% market policy failed");
    return { success: false, actionsRun: [], guardPassed: false, notes };
  }

  let guardPassed = true;
  if (ctx.step.guard) {
    const guard: any = (Guards as any)[ctx.step.guard];
    if (typeof guard === "function") {
      guardPassed = await guard(ctx);
      notes.push(`Guard ${ctx.step.guard}: ${guardPassed}`);
    }
  }
  if (!guardPassed) return { success: false, actionsRun: [], guardPassed, notes };

  const executed: Action[] = [];
  for (const action of ctx.step.actions) {
    await runAction(adapters, action, ctx);
    executed.push(action);
  }
  return { success: true, actionsRun: executed, guardPassed, notes };
};
