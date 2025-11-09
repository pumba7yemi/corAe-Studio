import { Field, Model, Plan, Step } from "./types.js";

function sqlType(t: string): string {
  // Minimal mapper; extend as needed.
  if (t.startsWith("enum:")) return `"${t.slice(5)}"`; // assume enum type exists
  switch (t) {
    case "uuid": return "uuid";
    case "int": return "integer";
    case "bigint": return "bigint";
    case "text": return "text";
    case "bool": return "boolean";
    default:
      if (/decimal\(\d+,\d+\)/i.test(t)) return t;
      return t; // pass-through
  }
}

function columnDef(f: Field): string {
  const parts = [`"${f.name}" ${sqlType(f.type)}`];
  if (!f.nullable) parts.push("NOT NULL");
  if (f.default !== undefined) {
    const v = typeof f.default === "string" ? `'${f.default}'` : String(f.default);
    parts.push(`DEFAULT ${v}`);
  }
  return parts.join(" ");
}

export function generateSQL(plan: Plan): string {
  const stmts: string[] = [];
  stmts.push("-- SMSME migration SQL (review before applying)");
  for (const s of plan.steps) {
    if (!s.target) continue;
    if (s.kind === "ADD_MODEL" && s.payload?.model) {
      const m = s.payload.model as Model;
      const cols = m.fields.map(columnDef).join(",\n  ");
      stmts.push(`CREATE TABLE "${m.dbName ?? m.name}" (\n  ${cols}\n);`);
      for (const u of (m.uniques ?? [])) {
        const uqName = u.name ?? `${m.name}_${u.fields.join("_")}_key`;
        stmts.push(`ALTER TABLE "${m.dbName ?? m.name}" ADD CONSTRAINT "${uqName}" UNIQUE (${u.fields.map(f => `"${f}"`).join(", ")});`);
      }
      for (const ix of (m.indexes ?? [])) {
        const ixName = ix.name ?? `${m.name}_${ix.fields.join("_")}_idx`;
        const uniq = ix.unique ? "UNIQUE " : "";
        stmts.push(`CREATE ${uniq}INDEX "${ixName}" ON "${m.dbName ?? m.name}" (${ix.fields.map(f => `"${f}"`).join(", ")});`);
      }
    }

    if (s.kind === "ADD_FIELD") {
      const [model, field] = s.target.split(".");
      const f = s.payload?.field as Field;
      stmts.push(`ALTER TABLE "${model}" ADD COLUMN ${columnDef(f)};`);
    }

    if (s.kind === "ALTER_FIELD_TYPE") {
      const [model, field] = s.target.split(".");
      const to = s.payload?.to as string;
      stmts.push(`ALTER TABLE "${model}" ALTER COLUMN "${field}" TYPE ${sqlType(to)} USING "${field}"::${sqlType(to)};`);
    }

    if (s.kind === "DROP_NOT_NULL") {
      const [model, field] = s.target.split(".");
      stmts.push(`ALTER TABLE "${model}" ALTER COLUMN "${field}" DROP NOT NULL;`);
    }

    if (s.kind === "SET_NOT_NULL") {
      const [model, field] = s.target.split(".");
      stmts.push(`ALTER TABLE "${model}" ALTER COLUMN "${field}" SET NOT NULL;`);
    }

    if (s.kind === "ADD_INDEX") {
      const [model, key] = s.target.split(":");
      const [_tag, name, fields] = key.split(":");
      const ixName = name && name.length ? name : `${model}_${fields.replace(/,/g, "_")}_idx`;
      const uniq = _tag === "U" ? "UNIQUE " : "";
      stmts.push(`CREATE ${uniq}INDEX "${ixName}" ON "${model}" (${fields.split(",").map(f => `"${f}"`).join(", ")});`);
    }

    if (s.kind === "DROP_INDEX") {
      const [model, key] = s.target.split(":");
      const [_tag, name, fields] = key.split(":");
      const ixName = name && name.length ? name : `${model}_${fields.replace(/,/g, "_")}_idx`;
      stmts.push(`DROP INDEX IF EXISTS "${ixName}";`);
    }

    if (s.kind === "ADD_UNIQUE") {
      const [model, key] = s.target.split(":");
      const [name, fields] = key.split(":");
      const uqName = name && name.length ? name : `${model}_${fields.replace(/,/g, "_")}_key`;
      stmts.push(`ALTER TABLE "${model}" ADD CONSTRAINT "${uqName}" UNIQUE (${fields.split(",").map(f => `"${f}"`).join(", ")});`);
    }

    if (s.kind === "DROP_UNIQUE") {
      const [model, key] = s.target.split(":");
      const [name, fields] = key.split(":");
      const uqName = name && name.length ? name : `${model}_${fields.replace(/,/g, "_")}_key`;
      stmts.push(`ALTER TABLE "${model}" DROP CONSTRAINT IF EXISTS "${uqName}";`);
    }

    if (s.kind === "BACKFILL") {
      // This is a placeholder; in real use you’d generate COPY/UPDATE batches.
      stmts.push(`-- BACKFILL required for ${s.target}. Implement batched UPDATEs here.`);
    }

    if (s.kind === "CREATE_VIEW_SHIM") {
      const model = s.target;
      const exposeField = s.payload?.exposeField as string | undefined;
      const cols = exposeField ? `*, "${exposeField}"` : "*";
      stmts.push(`CREATE OR REPLACE VIEW "${model}_legacy_view" AS SELECT ${cols} FROM "${model}";`);
    }

    if (s.kind === "DROP_FIELD") {
      const [model, field] = s.target.split(".");
      stmts.push(`ALTER TABLE "${model}" DROP COLUMN "${field}";`);
    }

    if (s.kind === "DROP_MODEL") {
      const model = s.target;
      stmts.push(`DROP TABLE IF EXISTS "${model}" CASCADE;`);
    }
  }
  return stmts.join("\n");
}