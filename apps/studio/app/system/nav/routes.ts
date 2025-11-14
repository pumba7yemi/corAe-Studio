/**
 * corAe Classic Routes Map™
 * Single flat ROUTES registry for Classic navigation (Home / Work / Business / System / Dev / Space)
 * Only modify paths here. Components should source labels/paths/icons from this file.
 */
import type { LucideIcon } from "lucide-react";
// Export icon keys (strings) that map to the registry icon set (see registry.ts)

export const ROUTES = {
  home: { path: "/ship/home", label: "Home", icon: "home" },
  work: { path: "/ship/work", label: "Work", icon: "workflow" },
  business: { path: "/ship/business", label: "Business", icon: "store" },

  system: { path: "/system", label: "CAIA / System", icon: "layout-dashboard" },
  dev: { path: "/ship/dev/overview", label: "Dev", icon: "globe" },

  // Space / Ship area
  ship: { path: "/ship/space", label: "Space", icon: "layout-dashboard" },
  shipped: { path: "/ship/space/shipped", label: "Shipped", icon: "store" },
  dockyard: { path: "/ship/space/dockyard", label: "Dockyard", icon: "inbox" },

  // Explicit space children
  spaceStudio: { path: "/ship/space/studio", label: "Studio", icon: "layout-dashboard" },
  spaceShip: { path: "/ship/space/ship", label: "Ship", icon: "rocket" },
  spaceShipped: { path: "/ship/space/shipped", label: "Shipped", icon: "store" },
  spaceDockyard: { path: "/ship/space/dockyard", label: "Dockyard", icon: "inbox" },
    // Legacy / additional engine routes (kept to avoid breaking references)
    pos: { path: "/ship/pos", label: "POS", icon: "credit-card" },
    finance: { path: "/ship/accounts", label: "Finance", icon: "finance" },
    cims: { path: "/ship/cims", label: "CIMS", icon: "inbox" },
    socialContract: { path: "/ship/home/social-contract", label: "Social Contract", icon: "store" },
    automate: { path: "/ship/automate", label: "Automate", icon: "rocket" },
    reserve: { path: "/ship/reserve", label: "Reserve", icon: "store" },
    oms: { path: "/oms", label: "OMS", icon: "layout-dashboard" },
    obari: { path: "/obari", label: "OBARI", icon: "layout-dashboard" },
    obariOrders: { path: "/obari/orders", label: "OBARI Orders", icon: "layout-dashboard" },
    obariBookings: { path: "/obari/bookings", label: "OBARI Bookings", icon: "layout-dashboard" },
    obariActive: { path: "/obari/active", label: "OBARI Active", icon: "layout-dashboard" },
    obariReporting: { path: "/obari/report", label: "OBARI Reports", icon: "layout-dashboard" },
    obariInvoicing: { path: "/obari/invoices", label: "OBARI Invoices", icon: "layout-dashboard" },
  } as const;

export type RouteKey = keyof typeof ROUTES;
