// packages/workflows-core/src/index.ts

/**
 * @corae/workflows-core — tiny flow runner & helpers
 * Usage:
 *   import { runFlow, type Step, step, pipe, noop, delay } from "@corae/workflows-core"
 */

/** A step transforms context Ctx (sync or async) */
export type Step<Ctx> = (ctx: Ctx) => Promise<Ctx> | Ctx;

/** Run steps left→right, threading context through each */
export async function runFlow<Ctx>(
  steps: ReadonlyArray<Step<Ctx>>,
  initial: Ctx
): Promise<Ctx> {
  let ctx = initial;
  for (const s of steps) ctx = await s(ctx);
  return ctx;
}

/** Helper to declare a step with proper typing */
export function step<Ctx>(fn: Step<Ctx>): Step<Ctx> {
  return fn;
}

/** Compose steps into a single callable */
export function pipe<Ctx>(...steps: ReadonlyArray<Step<Ctx>>) {
  return (initial: Ctx) => runFlow(steps, initial);
}

/** No-op step (keeps context as-is) */
export const noop = <Ctx>(ctx: Ctx): Ctx => ctx;

/** Delay helper to interleave waits inside flows */
export function delay(ms: number): Step<unknown> {
  return async (ctx) => {
    await new Promise((r) => setTimeout(r, ms));
    return ctx;
  };
}
