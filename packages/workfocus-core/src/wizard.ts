// Local in-file implementation to avoid depending on an external module that isn't installed.
export type Step<T> = (ctx: T) => T | Promise<T>;

export async function runFlow<T>(steps: Step<T>[], initial: T): Promise<T> {
  let ctx = initial;
  for (const step of steps) {
    ctx = await step(ctx);
  }
  return ctx;
}

/**
 * Wizard context carried through steps
 */
export type WizardCtx = {
  user: { id: string; name: string };
  plan: string[];
  log: string[];
};

/**
 * Steps
 */
const stepIntro: Step<WizardCtx> = (ctx: WizardCtx) => ({
  ...ctx,
  log: [...ctx.log, `👋 Hello ${ctx.user.name}`],
});

const stepChoosePlan: Step<WizardCtx> = (ctx: WizardCtx) => ({
  ...ctx,
  plan: ["Daily Review", "Top 3", "Focus Block 90m"],
  log: [...ctx.log, "🧭 Plan selected: Daily Review → Top 3 → Focus Block"],
});

const stepConfirm: Step<WizardCtx> = (ctx: WizardCtx) => ({
  ...ctx,
  log: [...ctx.log, "✅ Wizard complete"],
});

/**
 * Exported single-step (if you want to run just one)
 */
export const wizardStep: Step<WizardCtx> = (ctx: WizardCtx) => stepConfirm(ctx);

/**
 * Main entry — runs the full wizard flow
 */
export async function startWizard(userId = "u1", name = "Operator") {
  const initial: WizardCtx = { user: { id: userId, name }, plan: [], log: [] };
  // NOTE: runFlow signature is (steps, initial)
  const result = await runFlow<WizardCtx>([stepIntro, stepChoosePlan, stepConfirm], initial);
  return result;
}

/**
 * Optional helper to run with a custom initial context
 */
export async function runWizard(initial: WizardCtx) {
  return runFlow<WizardCtx>([stepIntro, stepChoosePlan, stepConfirm], initial);
}