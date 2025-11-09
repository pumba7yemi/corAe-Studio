// app/lib/automate/market.ts
import type { ExecutionContext } from "./types";

export type MarketSnapshot = {
  domain: string;
  target: string; // SKU/vendor/campaign/etc.
  baseline: number;
  ours: number;
  direction?: "lower-better" | "higher-better";
};

// Host app can override; default returns null (no block)
export const fetchSnapshot = async (_ctx: ExecutionContext): Promise<MarketSnapshot | null> => {
  return null;
};

export const ensurePlusOne = async (ctx: ExecutionContext): Promise<boolean> => {
  const snap = await fetchSnapshot(ctx);
  if (!snap) return true;
  const dir = snap.direction ?? "lower-better";
  if (dir === "lower-better") return snap.ours <= snap.baseline * 0.99;
  return snap.ours >= snap.baseline * 1.01;
};
