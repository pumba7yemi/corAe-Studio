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
};

/* ───── Builders ───── */
export function buildNav(): NavItem[] {
  const base: NavItem[] = [
    { id: "home", label: "Home", path: "/", icon: "home" },
    { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  ];

  const engines: NavItem[] = ENGINES.map((e) => ({
    id: e.id,
    label: e.name.replace(/^corAe\\s+/i, ""),
    path: e.paths?.dashboard ?? "/",
    category: e.category ?? "engines",
    icon: CATEGORY_ICON[e.category as keyof typeof CATEGORY_ICON] ?? "cpu",
  }));

  const seen = new Set<string>();
  return [...base, ...engines].filter((n) => {
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
  const order = ["Core", "work", "finance", "home", "communications", "automate", "marketplace", "engines"];
  const sorted: NavGroup[] = [];
  for (const key of order) if (groups.has(key)) sorted.push({ title: cap(key), items: groups.get(key)! });
  for (const [k, v] of groups) if (!order.includes(k)) sorted.push({ title: cap(k), items: v });
  return sorted;
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }