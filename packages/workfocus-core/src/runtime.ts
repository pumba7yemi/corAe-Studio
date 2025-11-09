export type Step<TCtx = any> = (ctx: TCtx) => Promise<TCtx> | TCtx;

export async function runFlow<TCtx>(ctx: TCtx, steps: Step<TCtx>[]) {
  let state = ctx;
  for (const step of steps) state = await step(state);
  return state;
}