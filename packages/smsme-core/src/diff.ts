import { EnumDef, Field, Index, Model, Snapshot, Step } from "./types.js";

type Dict<T> = Record<string, T>;

function byName<T extends { name: string }>(arr: T[] | undefined): Dict<T> {
  const out: Dict<T> = {};
  (arr ?? []).forEach(x => { out[x.name] = x; });
  return out;
}

function fieldDict(fields: Field[]): Dict<Field> {
  const d: Dict<Field> = {};
  fields.forEach(f => d[f.name] = f);
  return d;
}

function indexKey(ix: Index): string {
  const prefix = ix.unique ? "U" : "I";
  const name = ix.name ?? "";
  return `${prefix}:${name}:${ix.fields.join(",")}`;
}

export function diffSnapshots(fromS: Snapshot, toS: Snapshot): Step[] {
  const steps: Step[] = [];

  const fromM = byName(fromS.models);
  const toM = byName(toS.models);

  // Models added / dropped
  for (const name of Object.keys(toM)) {
    if (!fromM[name]) {
      steps.push({ kind: "ADD_MODEL", risk: "LOW", target: name, payload: { model: toM[name] } });
    }
  }
  for (const name of Object.keys(fromM)) {
    if (!toM[name]) {
      steps.push({ kind: "DROP_MODEL", risk: "DESTRUCTIVE", target: name, notes: "Dropping model removes data." });
    }
  }

  // For shared models, diff fields/indexes/uniques
  for (const name of Object.keys(toM)) {
    if (!fromM[name]) continue;
    const fromModel = fromM[name];
    const toModel = toM[name];

    // Fields
    const fFrom = fieldDict(fromModel.fields);
    const fTo = fieldDict(toModel.fields);

    // additions
    for (const fname of Object.keys(fTo)) {
      if (!fFrom[fname]) {
        const f = fTo[fname];
        const risk = f.nullable || f.default !== undefined ? "LOW" : "MEDIUM";
        steps.push({
          kind: "ADD_FIELD",
          risk,
          target: `${name}.${fname}`,
          payload: { field: f }
        });
      }
    }
    // drops + type/nullable changes
    for (const fname of Object.keys(fFrom)) {
      const a = fFrom[fname];
      const b = fTo[fname];
      if (!b) {
        steps.push({
          kind: "DROP_FIELD",
          risk: "DESTRUCTIVE",
          target: `${name}.${fname}`,
          notes: "Consider shim/backfill before drop."
        });
        continue;
      }
      if (a.type !== b.type) {
        steps.push({
          kind: "ALTER_FIELD_TYPE",
          risk: "MEDIUM",
          target: `${name}.${fname}`,
          payload: { from: a.type, to: b.type }
        });
      }
      const aNull = !!a.nullable;
      const bNull = !!b.nullable;
      if (!aNull && bNull) {
        steps.push({ kind: "DROP_NOT_NULL", risk: "LOW", target: `${name}.${fname}` });
      } else if (aNull && !bNull) {
        const r = b.default !== undefined ? "LOW" : "HIGH";
        steps.push({ kind: "SET_NOT_NULL", risk: r, target: `${name}.${fname}`, notes: r === "HIGH" ? "Backfill required." : undefined });
      }
    }

    // Indexes
    const fromI = new Set((fromModel.indexes ?? []).map(indexKey));
    const toI   = new Set((toModel.indexes ?? []).map(indexKey));
    for (const i of toI) if (!fromI.has(i)) steps.push({ kind: "ADD_INDEX", risk: "LOW", target: `${name}:${i}` });
    for (const i of fromI) if (!toI.has(i)) steps.push({ kind: "DROP_INDEX", risk: "LOW", target: `${name}:${i}` });

    // Uniques
    const fU = new Set((fromModel.uniques ?? []).map(u => (u.name ?? "") + ":" + u.fields.join(",")));
    const tU = new Set((toModel.uniques ?? []).map(u => (u.name ?? "") + ":" + u.fields.join(",")));
    for (const u of tU) if (!fU.has(u)) steps.push({ kind: "ADD_UNIQUE", risk: "LOW", target: `${name}:${u}` });
    for (const u of fU) if (!tU.has(u)) steps.push({ kind: "DROP_UNIQUE", risk: "MEDIUM", target: `${name}:${u}`, notes: "Dropping uniqueness can change business logic." });
  }

  // Enums (only support ADD value safely)
  const fromE = byName(fromS.enums ?? []);
  const toE = byName(toS.enums ?? []);
  for (const en of Object.keys(toE)) {
    if (!fromE[en]) continue;
    const a = new Set(fromE[en].values);
    for (const v of toE[en].values) {
      if (!a.has(v)) steps.push({ kind: "ADD_ENUM_VALUE", risk: "LOW", target: `${en}.${v}` });
    }
  }

  return steps;
}