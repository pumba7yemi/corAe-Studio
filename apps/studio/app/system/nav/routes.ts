/**
 * corAe Routes Map™
 * Single source of truth for every major area.
 * Edit paths here only — nothing else needs touching.
 */

export const ROUTES = {
  // NEW Business Pages (modern dashboard / cards)
  businessPages: "/business",

  // CLASSIC views (existing production paths in Ship)
  businessClassic: "/ship/business",   // ← corrected to real classic view
  workClassic: "/ship/work/pulse",     // ← OBARI / Pulse
  homeClassic: "/ship/home",           // ← adjust if different

  // OTHER ENGINES
  pos: "/ship/pos",
  finance: "/ship/accounts",
  cims: "/ship/cims",
  // Social Contract campaign landing
  socialContract: "/ship/home/social-contract",
  automate: "/ship/automate",
  reserve: "/ship/reserve",
  // OMS / OBARI — expose OBARI stages so overflow menus can list them
  oms: "/oms",
  obari: "/obari",
  obariOrders: "/obari/orders",
  obariBookings: "/obari/bookings",
  obariActive: "/obari/active",
  obariReporting: "/obari/report",
  obariInvoicing: "/obari/invoices",
  // corAe Space landing + shortcuts
  space: "/ship/space",
  spaceStudio: "/studio",
  spaceShip: "/ship",
  spaceShipped: "/ship/shipped",
  spaceDockyard: "/ship/dev/health",
} as const;