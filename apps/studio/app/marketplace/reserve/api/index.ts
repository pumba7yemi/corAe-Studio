// apps/studio/app/marketplace/reserve/api/index.ts
/**
 * corAe Reserve™ — Unified Export
 * Hub of BDO and Staging Post for BTDO
 * Provides programmatic access for other engines (OBARI™, Work OS, CIMS™)
 *
 * Core Exports:
 *  - Manifest (engine metadata)
 *  - API (handlers for all reservation flows)
 *  - Hooks (UI data/control layer)
 *  - Laws (BTDO / BDO constitutional flow)
 */

export * from "../manifest";
export * from "../hooks/useReserveFlow";
export * from "../laws/btdo.law";

/* ────────────────────────────────────────────────
   API Routes and Actions
────────────────────────────────────────────────── */
// Re-export API route handlers from their modules so consumers can import them from this
// unified entry. Use explicit module paths (these files live alongside this index).
export { GET as getReservations } from "./reservations";
export { GET as getDeals } from "./deals";
export { GET as getOrders } from "./order";
export { GET as getTrades } from "./trades";
export { POST as createReservation } from "./create";
export { POST as elevateReservation } from "./elevate";
export { POST as pricelockReservation } from "./pricelock";
export { POST as confirmDeal } from "./confirm";
export { POST as dispatchOrder } from "./dispatch";
export { GET as getTimeline } from "./timeline";