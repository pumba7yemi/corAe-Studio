// app/lib/automate/boot.ts
import * as registry from "./registry";
import { makeDevAdapters } from "./adapters/dev";
import { startScheduler } from "./scheduler";

/** Guard so Next's hot-reload / route handlers don't double-boot */
declare global {
  // eslint-disable-next-line no-var
  var __AUTOMATE_BOOTED__: boolean | undefined;
}

export function ensureAutomateBoot() {
  if (globalThis.__AUTOMATE_BOOTED__) return;
  // register dev adapters for demo tenant
  // if the registry exports hasAdaptersFor, use it; otherwise assume we need to set adapters
  const hasAdaptersFor = (registry as any).hasAdaptersFor;
  if (typeof hasAdaptersFor === "function" ? !hasAdaptersFor("demo") : true) {
    registry.setAdapters("demo", makeDevAdapters());
  }
  startScheduler(["demo"]);
  globalThis.__AUTOMATE_BOOTED__ = true;
}