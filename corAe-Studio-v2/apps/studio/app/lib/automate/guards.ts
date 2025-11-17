// app/lib/automate/guards.ts
import type { ExecutionContext } from "./types";

export const always = async (_ctx: ExecutionContext) => true;

export const approvedFlag = async (ctx: ExecutionContext) =>
  Boolean(ctx.vars?.approved ?? ctx.input?.approved);

export const withinCeiling = async (ctx: ExecutionContext) => {
  const price = Number(ctx.vars?.price ?? ctx.input?.price);
  const ceiling = Number(ctx.vars?.ceiling ?? ctx.input?.ceiling);
  if (Number.isNaN(price) || Number.isNaN(ceiling)) return false;
  return price <= ceiling;
};
