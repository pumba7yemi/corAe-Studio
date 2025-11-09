// Provide minimal ambient declarations for test globals so TypeScript won't error
// when @types/jest isn't installed or tsconfig doesn't include 'jest' types.
// Provide the globals directly on the global scope instead of augmenting
// the non-existent module '@jest/globals'.
declare global {
  const describe: any;
  const it: any;
  const expect: any;
}

// apps/studio/app/marketplace/reserve/tests/reserve.test.ts
import { canTransition, nextStage, statusFor } from "../laws/btdo.law";

describe("BTDO / BDO Flow Law", () => {
  it("should allow valid forward transitions", () => {
    const res = canTransition({ flowMode: "BDO", from: "BOOK", to: "DEAL", hasDeal: true });
    expect(res.ok).toBe(true);
  });

  it("should prevent backward transitions when locked", () => {
    const res = canTransition({
      flowMode: "BTDO",
      from: "TRADE_LOCKED",
      to: "TRADE_OPEN",
      locked: true,
    });
    expect(res.ok).toBe(false);
  });

  it("should require a pricelock before advancing beyond TRADE_OPEN", () => {
    const res = canTransition({
      flowMode: "BTDO",
      from: "TRADE_OPEN",
      to: "TRADE_LOCKED",
      hasPricelock: false,
    });
    expect(res.ok).toBe(false);
  });

  it("should reject ORDER transition without confirmed deal", () => {
    const res = canTransition({
      flowMode: "BDO",
      from: "DEAL",
      to: "ORDER",
      hasDeal: false,
    });
    expect(res.ok).toBe(false);
  });

  it("should return proper status labels", () => {
    expect(statusFor("BOOK")).toBe("BOOKED");
    expect(statusFor("DEAL")).toBe("DEAL_CONFIRMED");
  });

  it("should advance correctly for BDO and BTDO sequences", () => {
    expect(nextStage("BDO", "BOOK")).toBe("DEAL");
    expect(nextStage("BTDO", "TRADE_LOCKED")).toBe("DEAL");
  });
});