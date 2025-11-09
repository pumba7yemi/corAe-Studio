export type Domain = "HOME" | "WORK" | "BUSINESS";

export type HaveYouId = string; // stable, ULID/UUID elsewhere

export interface HaveYouItem {
  id: HaveYouId;
  domain: Domain;
  code: string;           // e.g. "HOME.MEAL.PREP"
  title: string;          // human label
  description?: string;
  cadence?: "DAILY" | "WEEKLY" | "MONTHLY" | "28DAY" | "ADHOC";
  dueAt?: string;         // ISO
  tags?: string[];
  // rule wiring
  requires?: HaveYouId[]; // must be true before this can complete
  blockers?: HaveYouId[]; // if true, this cannot complete
  rule?: Rule;
}

export interface RuleContext {
  now: Date;
  // hook for app state (e.g., vendor cycles, POS reports)
  facts: Record<string, unknown>;
  get(itemId: HaveYouId): HaveYouState | undefined;
}

export type Rule = (ctx: RuleContext, item: HaveYouItem) => RuleResult;

export type RuleResult =
  | { status: "PENDING"; reason?: string }
  | { status: "READY"; reason?: string }
  | { status: "BLOCKED"; reason?: string };

export interface HaveYouState {
  itemId: HaveYouId;
  lastDoneAt?: string;   // ISO
  doneCount: number;
  snoozedUntil?: string; // ISO
}

export interface StorageAdapter {
  loadStates(domain?: Domain): Promise<HaveYouState[]>;
  saveState(state: HaveYouState): Promise<void>;
  removeState(itemId: HaveYouId): Promise<void>;
}

export interface EngineInit {
  storage: StorageAdapter;
  items: HaveYouItem[];
}

export interface CheckResult {
  item: HaveYouItem;
  state: HaveYouState | undefined;
  rule: RuleResult;
  actionable: boolean; // READY and not blocked by deps
}