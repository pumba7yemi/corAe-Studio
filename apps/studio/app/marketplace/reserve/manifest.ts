// apps/studio/app/marketplace/reserve/manifest.ts
/**
 * corAe Reserve™ Manifest
 * Register module metadata for discovery, introspection, and linking across corAe OS².
 *
 * Reserve functions as:
 *  - The Booking Core for corAe Marketplace
 *  - The Operational Hub for BDO / BTDO flows
 *  - The Integration Bridge for CIMS™, OBARI™, Finance™, and Work OS
 */

export const ReserveManifest = {
  id: "corAe.Reserve",
  name: "corAe Reserve™",
  tagline: "Hub of BDO • Staging Post for BTDO",
  version: "1.0.0",
  type: "engine",
  category: "marketplace",
  author: "corAe OS²",
  summary:
    "The unified booking and brokerage system powering corAe Marketplace — bridging Book, Trade, Deal, and Order across all sectors and services.",
  integrations: {
    cims: true,
    obari: true,
    finance: true,
    workos: true,
    marketplace: true,
  },
  events: [
    "reserve.booked",
    "reserve.trade.opened",
    "reserve.pricelocked",
    "reserve.deal.confirmed",
    "reserve.order.dispatched",
  ],
  dependencies: {
    prisma: ">=5.0.0",
    next: ">=15.0.0",
    typescript: ">=5.3.0",
  },
  paths: {
    api: "/api/reserve",
    dashboard: "/marketplace/reserve/dashboard",
    schema: "/app/prisma/schema.prisma",
    law: "/apps/studio/app/marketplace/reserve/laws/btdo.law.ts",
  },
  status: {
    stage: "beta",
    lastUpdated: new Date().toISOString(),
  },
};

export default ReserveManifest;