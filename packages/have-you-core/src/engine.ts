import {
  CheckResult,
  EngineInit,
  HaveYouId,
  HaveYouItem,
  HaveYouState,
  RuleContext,
} from "./types.js";

export class HaveYouEngine {
  private storage: EngineInit["storage"];
  private items: Map<HaveYouId, HaveYouItem>;

  constructor(init: EngineInit) {
    this.storage = init.storage;
    this.items = new Map(init.items.map((i) => [i.id, i]));
  }

  list(): HaveYouItem[] {
    return [...this.items.values()];
  }

  async checkAll(facts: Record<string, unknown> = {}, now = new Date()): Promise<CheckResult[]> {
    const states = await this.storage.loadStates();
    const index = new Map(states.map((s) => [s.itemId, s]));

    const ctx: RuleContext = {
      now,
      facts,
      get: (id) => index.get(id),
    };

    const results: CheckResult[] = [];
    for (const item of this.items.values()) {
      const state = index.get(item.id);
      const ruleResult = item.rule ? item.rule(ctx, item) : { status: "READY" as const };
      const depsOk = (item.requires ?? []).every((rid) => {
        const rs = index.get(rid);
        return !!rs?.lastDoneAt;
      });
      const blockedByDeps = (item.blockers ?? []).some((bid) => {
        const bs = index.get(bid);
        return !!bs?.lastDoneAt; // blocker done => this blocked
      });

      const actionable = ruleResult.status === "READY" && depsOk && !blockedByDeps;

      results.push({ item, state, rule: ruleResult, actionable });
    }
    return results.sort((a, b) => Number(b.actionable) - Number(a.actionable));
  }

  async markDone(itemId: HaveYouId, when = new Date()) {
    const prev = (await this.storage.loadStates()).find((s) => s.itemId === itemId);
    const state: HaveYouState = {
      itemId,
      doneCount: (prev?.doneCount ?? 0) + 1,
      lastDoneAt: when.toISOString(),
    };
    await this.storage.saveState(state);
    return state;
  }

  async snooze(itemId: HaveYouId, until: Date) {
    const prev = (await this.storage.loadStates()).find((s) => s.itemId === itemId);
    const state: HaveYouState = {
      itemId,
      doneCount: prev?.doneCount ?? 0,
      lastDoneAt: prev?.lastDoneAt,
      snoozedUntil: until.toISOString(),
    };
    await this.storage.saveState(state);
    return state;
  }
}