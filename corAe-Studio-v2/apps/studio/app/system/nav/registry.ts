/* eslint-disable */
/**
 * corAe Nav Registryâ„¢ â€” Universal navigation metadata
 */
import type { LucideIcon } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  Store,
  Cpu,
  Workflow,
  CreditCard,
  Inbox,
  Rocket,
} from "lucide-react";

/* â”€â”€â”€â”€â”€ Engine Registry Fallback (replace with real import later) â”€â”€â”€â”€â”€ */
const FALLBACK_ENGINES = [
  { id: "reserve", name: "corAe Reserveâ„¢", category: "marketplace", paths: { dashboard: "/reserve" } },
  { id: "work", name: "corAe Work OS", category: "work", paths: { dashboard: "/work" } },
  { id: "finance", name: "corAe Financeâ„¢", category: "finance", paths: { dashboard: "/finance" } },
  { id: "home", name: "corAe Home", category: "home", paths: { dashboard: "/home" } },
  { id: "cims", name: "CIMSâ„¢", category: "communications", paths: { dashboard: "/cims" } },
  { id: "automate", name: "Automate", category: "automate", paths: { dashboard: "/automate" } },
];

let ENGINES = FALLBACK_ENGINES;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@/app/system/registry/engines");
  ENGINES = mod.ENGINES ?? FALLBACK_ENGINES;
} catch {}

/* â”€â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€ */
export interface NavItem {
  id: string;
  label: string;
  path: string;
  category?: string;
  icon?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/* â”€â”€â”€â”€â”€ Icons â”€â”€â”€â”€â”€ */
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  "layout-dashboard": LayoutDashboard,
  store: Store,
  cpu: Cpu,
  workflow: Workflow,
  finance: CreditCard,
  inbox: Inbox,
  rocket: Rocket,
  globe: LayoutDashboard,
};
export function getIcon(name?: string): LucideIcon | undefined {
  return name && ICONS[name] ? ICONS[name] : undefined;
}

const CATEGORY_ICON: Record<string, string> = {
  marketplace: "store",
  work: "workflow",
  finance: "finance",
  home: "home",
  communications: "inbox",
  automate: "rocket",
  // corAe Space category (landing with Studio / Ship / Shipped / Dockyard)
  space: "layout-dashboard",
};

/* â”€â”€â”€â”€â”€ Builders â”€â”€â”€â”€â”€ */
export function buildNav(): NavItem[] {
  const base: NavItem[] = [
    { id: "home", label: "Home", path: "/", icon: "home" },
    { id: "corae-space", label: "corAe Space", path: "/ship/space", icon: "layout-dashboard" },
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  ];

  // Explicit corAe Space children for clearer navigation grouping
  const spaceItems: NavItem[] = [
    { id: "space-studio", label: "Studio", path: "/ship/space/studio", category: "space", icon: "layout-dashboard" },
    { id: "space-ship", label: "Ship", path: "/ship/space/ship", category: "space", icon: "rocket" },
    { id: "space-shipped", label: "Shipped", path: "/ship/space/shipped", category: "space", icon: "store" },
    { id: "space-dockyard", label: "Dockyard", path: "/ship/space/dockyard", category: "space", icon: "inbox" },
  ];

  const devItems: NavItem[] = [
    { id: "dev-atlas", label: "Atlas", path: "/ship/dev/atlas", category: "dev", icon: "globe" },
    { id: "dev-patterns", label: "Patterns", path: "/ship/dev/patterns", category: "dev", icon: "workflow" },
    { id: "dev-gate-logs", label: "Gate Logs", path: "/ship/dev/gate-logs", category: "dev", icon: "inbox" },
    { id: "dev-health", label: "Health", path: "/ship/dev/health", category: "dev", icon: "inbox" },
  ];

  const engines: NavItem[] = ENGINES.map((e) => ({
    id: e.id,
    label: e.name.replace(/^corAe\\s+/i, ""),
    path: e.paths?.dashboard ?? "/",
    category: e.category ?? "engines",
    icon: CATEGORY_ICON[e.category as keyof typeof CATEGORY_ICON] ?? "cpu",
  }));

  const seen = new Set<string>();
  // Business Core / Front / Work / Home â€” explicit groups
  const businessCoreItems: NavItem[] = [
    { id: "biz-obari", label: "OBARI", path: "/business/core/obari", category: "businessCore", icon: "cpu" },
    { id: "biz-finance", label: "Finance", path: "/business/core/finance", category: "businessCore", icon: "finance" },
    { id: "biz-hr", label: "HR", path: "/business/core/hr", category: "businessCore", icon: "inbox" },
    { id: "biz-compliance", label: "Compliance", path: "/business/core/compliance", category: "businessCore", icon: "inbox" },
    { id: "biz-vendors", label: "Vendors", path: "/business/core/vendors", category: "businessCore", icon: "store" },
    { id: "biz-pos", label: "POS", path: "/business/core/pos", category: "businessCore", icon: "credit-card" },
    { id: "biz-cims", label: "CIMS", path: "/business/core/cims", category: "businessCore", icon: "inbox" },
    { id: "biz-filelogic", label: "FileLogic", path: "/business/core/filelogic", category: "businessCore", icon: "layout-dashboard" },
    { id: "biz-workfocus", label: "WorkFocus", path: "/business/core/workfocus", category: "businessCore", icon: "workflow" },
  ];

  const businessFrontItems: NavItem[] = [
    { id: "front-cleaning", label: "Cleaning", path: "/business/front/cleaning", category: "businessFront", icon: "store" },
    { id: "front-glam", label: "Glam & Glow", path: "/business/front/glam", category: "businessFront", icon: "store" },
    { id: "front-retail", label: "Retail", path: "/business/front/retail", category: "businessFront", icon: "store" },
    { id: "front-fitness", label: "Fitness", path: "/business/front/fitness", category: "businessFront", icon: "store" },
    { id: "front-waste", label: "Waste", path: "/business/front/waste", category: "businessFront", icon: "store" },
    { id: "front-marketing", label: "Marketing", path: "/business/front/marketing", category: "businessFront", icon: "store" },
    { id: "front-reserve", label: "Reserve", path: "/business/front/reserve", category: "businessFront", icon: "store" },
    { id: "front-property", label: "Property", path: "/business/front/property", category: "businessFront", icon: "store" },
    { id: "front-recruitment", label: "Recruitment", path: "/business/front/recruitment", category: "businessFront", icon: "store" },
  ];

  const workCoreItems: NavItem[] = [
    { id: "work-dashboard", label: "Dashboard", path: "/work/core/dashboard", category: "workCore", icon: "layout-dashboard" },
    { id: "work-tasks", label: "Tasks", path: "/work/core/tasks", category: "workCore", icon: "workflow" },
    { id: "work-cims", label: "CIMS", path: "/work/core/cims", category: "workCore", icon: "inbox" },
    { id: "work-training", label: "Training", path: "/work/core/training", category: "workCore", icon: "layout-dashboard" },
    { id: "work-schedule", label: "Schedule", path: "/work/core/schedule", category: "workCore", icon: "layout-dashboard" },
  ];

  const homeCoreItems: NavItem[] = [
    { id: "home-faith", label: "Faith", path: "/home/core/faith", category: "homeCore", icon: "home" },
    { id: "home-personal-care", label: "Personal Care", path: "/home/core/personal-care", category: "homeCore", icon: "store" },
    { id: "home-cleaning", label: "Cleaning", path: "/home/core/cleaning", category: "homeCore", icon: "store" },
    { id: "home-meals", label: "Meals", path: "/home/core/meals", category: "homeCore", icon: "store" },
    { id: "home-finance", label: "Home Finance", path: "/home/core/home-finance", category: "homeCore", icon: "finance" },
    { id: "home-wellness", label: "Wellness", path: "/home/core/wellness", category: "homeCore", icon: "home" },
    { id: "home-family", label: "Family", path: "/home/core/family", category: "homeCore", icon: "home" },
  ];

  // Merge base, explicit space items, business groups, front groups, dev items, then engines â€” keep unique by id+path
  return [...base, ...spaceItems, ...businessCoreItems, ...businessFrontItems, ...workCoreItems, ...homeCoreItems, ...devItems, ...engines].filter((n) => {
    const key = `${n.id}:${n.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildNavGroups(): NavGroup[] {
  const flat = buildNav();
  const groups = new Map<string, NavItem[]>();
  for (const n of flat) {
    const key = n.category ?? "Core";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(n);
  }
  const order = ["Core", "space", "businessCore", "businessFront", "workCore", "homeCore", "dev", "work", "finance", "home", "communications", "automate", "marketplace", "engines"];
  const enhancedOrder = order;
  const sorted: NavGroup[] = [];
  for (const key of enhancedOrder) if (groups.has(key)) sorted.push({ title: cap(key), items: groups.get(key)! });
  for (const [k, v] of groups) if (!order.includes(k)) sorted.push({ title: cap(k), items: v });
  return sorted;
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
