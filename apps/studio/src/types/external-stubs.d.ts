// Lightweight external module stubs to reduce transient type errors while
// local development continues. These are intentionally permissive and can be
// removed/replaced when proper @types or packages are available.

declare module "lucide-react" {
  import * as React from "react";
  export type LucideIcon = React.ComponentType<any>;
  export const Home: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Store: LucideIcon;
  export const Cpu: LucideIcon;
  export const Workflow: LucideIcon;
  export const CreditCard: LucideIcon;
  export const Inbox: LucideIcon;
  export const Rocket: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const Wallet: LucideIcon;
  export const LineChart: LucideIcon;
  export const Users: LucideIcon;
  export const Settings: LucideIcon;
  export const Activity: LucideIcon;
  export const House: LucideIcon;
  export const Building2: LucideIcon;
  export const Briefcase: LucideIcon;
  export const ArrowLeftRight: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const WorkflowIcon: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const Clock4: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CalendarDays: LucideIcon;
  export const DollarSign: LucideIcon;
  export const PackageSearch: LucideIcon;
  export const ClipboardList: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Bell: LucideIcon;
  export const Send: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export default Home;
}

declare module "openai" {
  const anything: any;
  export default anything;
}

declare module "openai/resources/chat/completions" {
  const anything: any;
  export type ChatCompletionMessageParam = any;
  export default anything;
}

declare module "dotenv" {
  export function config(...args: any[]): any;
}

declare module "@corae/home" {
  const anything: any;
  export const HomeData: any;
  export const MealPlanner: any;
  export const CleaningScheduleTile: any;
  export const FitnessTile: any;
  export const WardrobeTile: any;
  export const GlamAndGlowTile: any;
  export const WhatIWantTile: any;
  export default anything;
}

declare module "@corae/caia-core" {
  const anything: any;
  export = anything;
}

declare module "@corae/caia-core/memory-cube" {
  const anything: any;
  export = anything;
}

declare module "@corae/workflows-core" {
  const anything: any;
  export = anything;
}

// Wildcard for local components imports to reduce transient missing-module errors
declare module "@/components/*" {
  const anyExport: any;
  export default anyExport;
}
