// apps/studio/apps/ship/app/business/oms/obari/index.ts
// OBARI — Core Stage Manifest (Order → Booking → Active → Report → Invoice)
// Acts as the single re-export surface for all OBARI stage logic.
//
// Each stage module is designed to be side-effect free and testable.
// All persistence / IO / UI handled by API routes or corAe runtime adapters.

export * as order from "./order/staging/contract";
export * as booking from "./booking/contract";
// export * as active from "./active/contract"; // module file missing in this path (kept commented to allow build)
// export * as report from "./report/contract"; // module file missing in this path
// export * as invoice from "./invoice/contract"; // module file missing in this path

/**
 * OBARI Stages (Immutable Flow):
 *  1. PREP / SCHEDULE → handled under BDO (Brokered Deal Order)
 *  2. ORDER (static snapshot)
 *  3. BOOKING (assignment, routing, confirmation)
 *  4. ACTIVE (execution)
 *  5. REPORT (variance / compliance)
 *  6. INVOICE (financial closure)
 */
export const OBARI_STAGES = [
  "prep",
  "schedule",
  "order",
  "booking",
  "active",
  "report",
  "invoice",
] as const;

export type ObariStage = (typeof OBARI_STAGES)[number];

/**
 * Utility to assert legal forward-only transition.
 * Returns true only when target stage is ahead of source.
 */
export function canTransition(from: ObariStage, to: ObariStage): boolean {
  const a = OBARI_STAGES.indexOf(from);
  const b = OBARI_STAGES.indexOf(to);
  return a >= 0 && b > a;
}

/**
 * Convenience transition map for UI flows and timeline renders.
 */
export const OBARI_NEXT: Record<ObariStage, ObariStage | null> = {
  prep: "schedule",
  schedule: "order",
  order: "booking",
  booking: "active",
  active: "report",
  report: "invoice",
  invoice: null,
};