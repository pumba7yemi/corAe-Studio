// apps/studio/app/marketplace/reserve/laws/btdo.law.ts

/**
 * corAe Constitutional Flow Law (BTDO/BDO) — Reserve Staging
 *
 * Reserve is the BDO Hub and BTDO Staging Post.
 * - BDO: Book → Deal → Order (default/simple)
 * - BTDO: Book → Trade → Deal → Order (elevated/complex)
 *
 * This module centralizes constants, guards, and transition checks.
 */

export type FlowMode = "BDO" | "BTDO";
export type BtdoStage = "BOOK" | "TRADE_OPEN" | "TRADE_LOCKED" | "DEAL" | "ORDER" | "DONE";
export type BdoStage = "BOOK" | "DEAL" | "ORDER" | "DONE";

export const STATES = {
  BDO: ["BOOK", "DEAL", "ORDER", "DONE"] as const,
  BTDO: ["BOOK", "TRADE_OPEN", "TRADE_LOCKED", "DEAL", "ORDER", "DONE"] as const,
};

export const TERMINAL = new Set<BtdoStage | BdoStage>(["DONE"]);

export const ERR = {
  INVALID_TRANSITION: "Invalid state transition.",
  LOCKED_STAGE: "Stage is locked; reversal not permitted.",
  MISSING_PRICELOCK: "Pricelock is required to advance.",
  MISSING_DEAL: "Deal confirmation required.",
};

export interface TransitionContext {
  flowMode: FlowMode;
  from: BtdoStage | BdoStage;
  to: BtdoStage | BdoStage;
  hasPricelock?: boolean;
  hasDeal?: boolean;
  locked?: boolean;
}

/** Validate a proposed transition under BTDO/BDO law. */
export function canTransition(ctx: TransitionContext): { ok: boolean; reason?: string } {
  if (TERMINAL.has(ctx.from)) return { ok: false, reason: ERR.INVALID_TRANSITION };

  const seq: readonly string[] = ctx.flowMode === "BTDO" ? STATES.BTDO : STATES.BDO;
  const fromIdx = seq.indexOf(ctx.from as any);
  const toIdx = seq.indexOf(ctx.to as any);

  if (fromIdx === -1 || toIdx === -1) return { ok: false, reason: ERR.INVALID_TRANSITION };
  if (toIdx < fromIdx) {
    // backwards moves only allowed if not locked and not crossing a lock boundary
    if (ctx.locked) return { ok: false, reason: ERR.LOCKED_STAGE };
  }

  // Gate checks
  if (ctx.flowMode === "BTDO") {
    // Must have pricelock to move beyond TRADE_OPEN
    if (ctx.from === "TRADE_OPEN" && toIdx > seq.indexOf("TRADE_OPEN") && !ctx.hasPricelock) {
      return { ok: false, reason: ERR.MISSING_PRICELOCK };
    }
  }

  // Deal must exist before ORDER
  if (ctx.to === "ORDER" && !ctx.hasDeal) {
    return { ok: false, reason: ERR.MISSING_DEAL };
  }

  return { ok: true };
}

/** Normalize a status string for UI and persistence */
export function statusFor(stage: BtdoStage | BdoStage): string {
  switch (stage) {
    case "BOOK":
      return "BOOKED";
    case "TRADE_OPEN":
      return "TRADE_OPEN";
    case "TRADE_LOCKED":
      return "PRICELOCKED";
    case "DEAL":
      return "DEAL_CONFIRMED";
    case "ORDER":
      return "SCHEDULED";
    case "DONE":
      return "FULFILLED";
    default:
      return "UNKNOWN";
  }
}

/** Advance helper: returns next stage for a given flow mode & current stage */
export function nextStage(flow: FlowMode, current: BtdoStage | BdoStage): BtdoStage | BdoStage {
  const seq = flow === "BTDO" ? STATES.BTDO : STATES.BDO;
  const i = seq.indexOf(current as any);
  return i >= 0 && i < seq.length - 1 ? (seq[i + 1] as any) : current;
}