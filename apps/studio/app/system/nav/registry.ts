/* eslint-disable */
/**
 * corAe Nav Registry™ — Universal navigation metadata
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

/* ───── Engine Registry Fallback (replace with real import later) ───── */
const FALLBACK_ENGINES = [
  { id: "reserve", name: "corAe Reserve™", category: "marketplace", paths: { dashboard: "/reserve" } },
  { id: "work", name: "corAe Work OS", category: "work", paths: { dashboard: "/work" } },
  { id: "finance", name: "corAe Finance™", category: "finance", paths: { dashboard: "/finance" } },
  { id: "home", name: "corAe Home", category: "home", paths: { dashboard: "/home" } },
  { id: "cims", name: "CIMS™", category: "communications", paths: { dashboard: "/cims" } },
  { id: "automate", name: "Automate", category: "automate", paths: { dashboard: "/automate" } },
];

let ENGINES = FALLBACK_ENGINES;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("@/app/system/registry/engines");
  ENGINES = mod.ENGINES ?? FALLBACK_ENGINES;
} catch {}

/* ───── Types ───── */
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

/* ───── Icons ───── */
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

/* ───── Builders ───── */
export function buildNav(): NavItem[] {
  const base: NavItem[] = [
    { id: "home", label: "Home", path: "/", icon: "home" },
    { id: "corae-space", label: "corAe Space", path: "/ship/space", icon: "layout-dashboard" },
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  ];

  // Explicit corAe Space children for clearer navigation grouping
  const spaceItems: NavItem[] = [
    { id: "space-studio", label: "Studio", path: "/studio", category: "space", icon: "layout-dashboard" },
    { id: "space-ship", label: "Ship", path: "/ship", category: "space", icon: "rocket" },
    { id: "space-shipped", label: "Shipped", path: "/ship/shipped", category: "space", icon: "store" },
    { id: "space-dockyard", label: "Dockyard", path: "/ship/dev/health", category: "space", icon: "inbox" },
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
  // Merge base, explicit space items, dev items, then engines — keep unique by id+path
  return [...base, ...spaceItems, ...devItems, ...engines].filter((n) => {
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
  const order = ["Core", "dev", "work", "finance", "home", "communications", "automate", "marketplace", "engines"];
  // place `space` just after Core for visibility
  const enhancedOrder = ["Core", "space", ...order.filter((o) => o !== "Core")];
  const sorted: NavGroup[] = [];
  for (const key of enhancedOrder) if (groups.has(key)) sorted.push({ title: cap(key), items: groups.get(key)! });
  for (const [k, v] of groups) if (!order.includes(k)) sorted.push({ title: cap(k), items: v });
  return sorted;
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }