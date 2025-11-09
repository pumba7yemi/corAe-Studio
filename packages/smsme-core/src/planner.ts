import { Plan, Snapshot, Step } from "./types.js";
import { diffSnapshots } from "./diff.js";
import { injectMitigations, summarizeRisk } from "./risk.js";
import { stableHash } from "./hash.js";

export function makePlan(fromS: Snapshot | null, toS: Snapshot): Plan {
  const steps = diffSnapshots(fromS ?? emptySnapshot(), toS);
  const withMitigation = injectMitigations(steps);

  // Basic ordering heuristic:
  // 1) ADD_MODEL/ADD_FIELD/ADD_INDEX/ADD_UNIQUE
  // 2) ALTERs / DROP_NOT_NULL
  // 3) BACKFILL / SET_NOT_NULL
  // 4) CREATE_VIEW_SHIM
  // 5) DROP_INDEX/UNIQUE/FIELD/MODEL
  const orderPriority: Record<string, number> = {
    ADD_MODEL: 10, ADD_FIELD: 20, ADD_INDEX: 30, ADD_UNIQUE: 30,
    ALTER_FIELD_TYPE: 40, DROP_NOT_NULL: 45,
    BACKFILL: 50, SET_NOT_NULL: 55,
    CREATE_VIEW_SHIM: 60,
    DROP_INDEX: 80, DROP_UNIQUE: 80, DROP_FIELD: 90, DROP_MODEL: 100,
    ADD_ENUM_VALUE: 25, CUSTOM_SQL: 70, RENAME_FIELD: 35, RENAME_MODEL: 35, DROP_VIEW_SHIM: 95
  };
  withMitigation.forEach((s, i) => s.order = (orderPriority[s.kind] ?? 999) * 1000 + i);

  const sorted = withMitigation.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const plan: Plan = {
    id: "plan_" + stableHash({ from: fromS?.schemaHash ?? null, to: toS.schemaHash }).slice(0, 12),
    fromHash: fromS?.schemaHash ?? null,
    toHash: toS.schemaHash,
    createdAt: new Date().toISOString(),
    status: "DRAFT",
    steps: sorted,
    riskSummary: summarizeRisk(sorted)
  };
  return plan;
}

function emptySnapshot(): Snapshot {
  return {
    label: "EMPTY",
    schemaHash: "0",
    createdAt: new Date(0).toISOString(),
    models: [],
    enums: []
  };
}