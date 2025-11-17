/**
 * corAe Classic Routes Map™
 * Single flat ROUTES registry for Classic navigation (Home / Work / Business / System / Dev / Space)
 * Only modify paths here. Components should source labels/paths/icons from this file.
 */
import type { LucideIcon } from "lucide-react";
// Export icon keys (strings) that map to the registry icon set (see registry.ts)

export const ROUTES = {
  home: "/ship/home",
  work: "/ship/work",
  business: "/ship/business",

  system: "/system",
  dev: "/ship/dev/overview",

  ship: "/ship/space",
  shipped: "/ship/space/shipped",
  dockyard: "/ship/space/dockyard",

  spaceStudio: "/ship/space/studio",
  spaceShip: "/ship/space/ship",
  spaceShipped: "/ship/space/shipped",
  spaceDockyard: "/ship/space/dockyard",

  // Legacy / additional engine routes (kept to avoid breaking references)
  pos: "/ship/pos",
  finance: "/ship/accounts",
  cims: "/ship/cims",
  ascend: "/ascend",
  socialContract: "/ship/home/social-contract",
  automate: "/ship/automate",
  reserve: "/ship/reserve",
  oms: "/oms",
  obari: "/obari",
  obariOrders: "/obari/orders",
  obariBookings: "/obari/bookings",
  obariActive: "/obari/active",
  obariReporting: "/obari/report",
  obariInvoicing: "/obari/invoices",
} as const;

export const ROUTE_META = {
  home: { label: "Home", icon: "home" },
  work: { label: "Work", icon: "workflow" },
  business: { label: "Business", icon: "store" },
  system: { label: "CAIA / System", icon: "layout-dashboard" },
  dev: { label: "Dev", icon: "globe" },
  ship: { label: "Space", icon: "layout-dashboard" },
  shipped: { label: "Shipped", icon: "store" },
  dockyard: { label: "Dockyard", icon: "inbox" },
  spaceStudio: { label: "Studio", icon: "layout-dashboard" },
  spaceShip: { label: "Ship", icon: "rocket" },
  spaceShipped: { label: "Shipped", icon: "store" },
  spaceDockyard: { label: "Dockyard", icon: "inbox" },
  pos: { label: "POS", icon: "credit-card" },
  finance: { label: "Finance", icon: "finance" },
  cims: { label: "CIMS", icon: "inbox" },
  socialContract: { label: "Social Contract", icon: "store" },
  automate: { label: "Automate", icon: "rocket" },
  reserve: { label: "Reserve", icon: "store" },
  oms: { label: "OMS", icon: "layout-dashboard" },
  obari: { label: "OBARI", icon: "layout-dashboard" },
  obariOrders: { label: "OBARI Orders", icon: "layout-dashboard" },
  obariBookings: { label: "OBARI Bookings", icon: "layout-dashboard" },
  obariActive: { label: "OBARI Active", icon: "layout-dashboard" },
  obariReporting: { label: "OBARI Reports", icon: "layout-dashboard" },
  obariInvoicing: { label: "OBARI Invoices", icon: "layout-dashboard" },
  ascend: { label: "Ascend", icon: "layout-dashboard" },
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteMetaKey = keyof typeof ROUTE_META;
