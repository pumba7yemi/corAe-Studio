// apps/studio/app/api/smsme/run/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

/** ---------- Types (trimmed) ---------- */
type SM_Risk = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "DESTRUCTIVE";
type Field   = { name: string; type: string; nullable?: boolean; default?: any };
type Index   = { name?: string | null; fields: string[]; unique?: boolean };
type Unique  = { name?: string | null; fields: string[] };
type Model   = { name: string; dbName?: string | null; fields: Field[]; indexes?: Index[]; uniques?: Unique[] };
type EnumDef = { name: string; values: string[] };
type Snapshot = { label?: string | null; prismaVer?: string | null; models: Model[]; enums?: EnumDef[] };
type StepKind =
  | "ADD_MODEL" | "DROP_MODEL" | "ADD_FIELD" | "DROP_FIELD" | "ALTER_FIELD_TYPE"
  | "SET_NOT_NULL" | "DROP_NOT_NULL" | "ADD_INDEX" | "DROP_INDEX"
  | "ADD_UNIQUE" | "DROP_UNIQUE" | "ADD_ENUM_VALUE" | "CREATE_VIEW_SHIM" | "BACKFILL";
type Step = { kind: StepKind; risk: SM_Risk; target?: string; payload?: Record<string, any>; notes?: string; order?: number };
type Plan = { id: string; createdAt: string; status: "DRAFT"|"LOCKED"|"APPLIED"; steps: Step[]; riskSummary: Record<SM_Risk,number> };

/** ---------- Robust path resolve ---------- */
function findSmsmeDir(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    const attempt = path.join(dir, "smsme-core");
    if (fs.existsSync(attempt) && fs.statSync(attempt).isDirectory()) return attempt;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`smsme-core folder not found (searched up from ${start})`);
}

/** ---------- Helpers ---------- */
function safeReadJson(p: string): any | null {
  try {
    if (!fs.existsSync(p)) return null;
    const txt = fs.readFileSync(p, "utf8").trim();
    if (!txt) return null;
    return JSON.parse(txt);
  } catch { return null; }
}
function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }
function writeJson(p: string, obj: any) { fs.writeFileSync(p, JSON.stringify(obj, null, 2)); }
function riskSummary(steps: Step[]): Record<SM_Risk, number> {
  const r: Record<SM_Risk, number> = { NONE:0, LOW:0, MEDIUM:0, HIGH:0, DESTRUCTIVE:0 };
  for (const s of steps) r[s.risk] = (r[s.risk] ?? 0) + 1;
  return r;
}
function sqlType(t: string): string {
  if (t.startsWith("enum:")) return `"${t.slice(5)}"`;
  if (/^decimal\(\d+,\d+\)$/i.test(t)) return t;
  const m: Record<string,string> = { uuid:"uuid", int:"integer", bigint:"bigint", text:"text", bool:"boolean" };
  return m[t] ?? t;
}
function colDef(f: Field): string {
  const parts = [`"${f.name}" ${sqlType(f.type)}`];
  if (!f.nullable) parts.push("NOT NULL");
  if (f.default !== undefined) {
    const v = typeof f.default === "string" ? `'${f.default}'` : String(f.default);
    parts.push(`DEFAULT ${v}`);
  }
  return parts.join(" ");
}

/** ---------- Diff (compact) ---------- */
function byName<T extends {name: string}>(arr?: T[]) { const d: Record<string,T> = {}; (arr??[]).forEach(x=>d[x.name]=x); return d; }
function fieldDict(a: Field[]) { const d: Record<string,Field> = {}; a.forEach(f=>d[f.name]=f); return d; }

function diffSnapshots(fromS: Snapshot, toS: Snapshot): Step[] {
  const steps: Step[] = [];
  const fM = byName(fromS.models), tM = byName(toS.models);

  // models
  for (const m of Object.keys(tM)) if (!fM[m]) steps.push({ kind:"ADD_MODEL", risk:"LOW", target:m, payload:{ model: tM[m] }});
  for (const m of Object.keys(fM)) if (!tM[m]) steps.push({ kind:"DROP_MODEL", risk:"DESTRUCTIVE", target:m, notes:"Dropping model removes data." });

  // fields/indexes/uniques on shared models
  for (const m of Object.keys(tM)) {
    if (!fM[m]) continue;
    const A = fM[m], B = tM[m];
    const aF = fieldDict(A.fields), bF = fieldDict(B.fields);

    // additions
    for (const fn of Object.keys(bF)) if (!aF[fn]) {
      const f = bF[fn];
      steps.push({ kind:"ADD_FIELD", risk:(f.nullable || f.default!==undefined) ? "LOW":"MEDIUM", target:`${m}.${fn}`, payload:{ field:f }});
    }
    // drops / alters
    for (const fn of Object.keys(aF)) {
      const a = aF[fn], b = bF[fn];
      if (!b) { steps.push({ kind:"DROP_FIELD", risk:"DESTRUCTIVE", target:`${m}.${fn}`, notes:"Consider shim/backfill first." }); continue; }
      if (a.type !== b.type) steps.push({ kind:"ALTER_FIELD_TYPE", risk:"MEDIUM", target:`${m}.${fn}`, payload:{ from:a.type, to:b.type }});
      const aN = !!a.nullable, bN = !!b.nullable;
      if (!aN && bN) steps.push({ kind:"DROP_NOT_NULL", risk:"LOW", target:`${m}.${fn}` });
      if (aN && !bN) steps.push({ kind:"SET_NOT_NULL", risk:(b.default!==undefined) ? "LOW":"HIGH", target:`${m}.${fn}`, notes:(b.default===undefined) ? "Backfill required before constraint.":undefined });
    }

    // indexes
    const keyI = (ix: Index) => `${ix.unique?'U':'I'}:${ix.name??""}:${ix.fields.join(",")}`;
    const aI = new Set((A.indexes??[]).map(keyI)), bI = new Set((B.indexes??[]).map(keyI));
    for (const k of bI) if (!aI.has(k)) steps.push({ kind:"ADD_INDEX", risk:"LOW", target:`${m}:${k}` });
    for (const k of aI) if (!bI.has(k)) steps.push({ kind:"DROP_INDEX", risk:"LOW", target:`${m}:${k}` });

    // uniques
    const keyU = (u: Unique) => `${u.name??""}:${u.fields.join(",")}`;
    const aU = new Set((A.uniques??[]).map(keyU)), bU = new Set((B.uniques??[]).map(keyU));
    for (const k of bU) if (!aU.has(k)) steps.push({ kind:"ADD_UNIQUE", risk:"LOW", target:`${m}:${k}` });
    for (const k of aU) if (!bU.has(k)) steps.push({ kind:"DROP_UNIQUE", risk:"MEDIUM", target:`${m}:${k}`, notes:"Dropping uniqueness can change business logic." });
  }

  // enums (safe add)
  const fE = byName(fromS.enums??[]), tE = byName(toS.enums??[]);
  for (const en of Object.keys(tE)) if (fE[en]) {
    const have = new Set(fE[en].values);
    for (const v of tE[en].values) if (!have.has(v)) steps.push({ kind:"ADD_ENUM_VALUE", risk:"LOW", target:`${en}.${v}` });
  }

  // Mitigations + ordering
  const out: Step[] = [];
  for (const s of steps) {
    out.push(s);
    if (s.kind === "SET_NOT_NULL" && s.risk === "HIGH") out.push({ kind:"BACKFILL", risk:"MEDIUM", target:s.target, notes:"Populate nulls/defaults before constraint." });
    if (s.kind === "DROP_FIELD" && s.risk === "DESTRUCTIVE" && s.target) {
      const [model, field] = s.target.split(".");
      out.push({ kind:"CREATE_VIEW_SHIM", risk:"LOW", target:model, notes:`Expose legacy ${field} via view during transition.`, payload:{ exposeField: field }});
      out.push({ kind:"BACKFILL", risk:"MEDIUM", target:s.target, notes:"Copy legacy data before dropping." });
    }
  }
  const prio: Record<StepKind, number> = {
    ADD_MODEL:10, ADD_FIELD:20, ADD_INDEX:30, ADD_UNIQUE:30,
    ALTER_FIELD_TYPE:40, DROP_NOT_NULL:45,
    BACKFILL:50, SET_NOT_NULL:55,
    CREATE_VIEW_SHIM:60,
    DROP_INDEX:80, DROP_UNIQUE:80, DROP_FIELD:90, DROP_MODEL:100,
    ADD_ENUM_VALUE:25
  } as any;
  out.forEach((s,i)=>s.order=(prio[s.kind]??999)*1000+i);
  out.sort((a,b)=> (a.order??0)-(b.order??0));
  return out;
}

/** ---------- SQL generation ---------- */
function sqlFromPlan(steps: Step[]): string {
  const stmts: string[] = ["-- SMSME migration SQL (generated in-process)"];
  for (const s of steps) {
    if (!s.target) continue;
    if (s.kind==="ADD_MODEL" && s.payload?.model) {
      const m = s.payload.model as Model;
      const table = m.dbName ?? m.name;
      const cols = m.fields.map(colDef).join(",\n  ");
      stmts.push(`CREATE TABLE "${table}" (\n  ${cols}\n);`);
      for (const u of (m.uniques??[])) {
        const nm = u.name ?? `${m.name}_${u.fields.join("_")}_key`;
        stmts.push(`ALTER TABLE "${table}" ADD CONSTRAINT "${nm}" UNIQUE (${u.fields.map(f=>`"${f}"`).join(", ")});`);
      }
      for (const ix of (m.indexes??[])) {
        const nm = ix.name ?? `${m.name}_${ix.fields.join("_")}_idx`;
        const uq = ix.unique ? "UNIQUE " : "";
        stmts.push(`CREATE ${uq}INDEX "${nm}" ON "${table}" (${ix.fields.map(f=>`"${f}"`).join(", ")});`);
      }
    }
    if (s.kind==="ADD_FIELD") {
      const [model] = s.target.split(".");
      const f = s.payload?.field as Field;
      stmts.push(`ALTER TABLE "${model}" ADD COLUMN ${colDef(f)};`);
    }
    if (s.kind==="ALTER_FIELD_TYPE") {
      const [model, field] = s.target.split(".");
      const to = s.payload?.to as string;
      stmts.push(`ALTER TABLE "${model}" ALTER COLUMN "${field}" TYPE ${sqlType(to)} USING "${field}"::${sqlType(to)};`);
    }
    if (s.kind==="DROP_NOT_NULL") {
      const [model, field] = s.target.split(".");
      stmts.push(`ALTER TABLE "${model}" ALTER COLUMN "${field}" DROP NOT NULL;`);
    }
    if (s.kind==="SET_NOT_NULL") {
      const [model, field] = s.target.split(".");
      stmts.push(`ALTER TABLE "${model}" ALTER COLUMN "${field}" SET NOT NULL;`);
    }
    if (s.kind==="ADD_INDEX" || s.kind==="DROP_INDEX") {
      const [model, key] = s.target.split(":");
      const [tag, name, fields] = key.split(":");
      const nm = name && name.length ? name : `${model}_${fields.replace(/,/g,"_")}_idx`;
      if (s.kind==="ADD_INDEX") {
        const uq = tag==="U" ? "UNIQUE " : "";
        stmts.push(`CREATE ${uq}INDEX "${nm}" ON "${model}" (${fields.split(",").map(f=>`"${f}"`).join(", ")});`);
      } else {
        stmts.push(`DROP INDEX IF EXISTS "${nm}";`);
      }
    }
    if (s.kind==="ADD_UNIQUE" || s.kind==="DROP_UNIQUE") {
      const [model, key] = s.target.split(":");
      const [name, fields] = key.split(":");
      const nm = name && name.length ? name : `${model}_${fields.replace(/,/g,"_")}_key`;
      if (s.kind==="ADD_UNIQUE") {
        stmts.push(`ALTER TABLE "${model}" ADD CONSTRAINT "${nm}" UNIQUE (${fields.split(",").map(f=>`"${f}"`).join(", ")});`);
      } else {
        stmts.push(`ALTER TABLE "${model}" DROP CONSTRAINT IF EXISTS "${nm}";`);
      }
    }
    if (s.kind==="CREATE_VIEW_SHIM") {
      const model = s.target;
      stmts.push(`CREATE OR REPLACE VIEW "${model}_legacy_view" AS SELECT * FROM "${model}";`);
    }
    if (s.kind==="DROP_FIELD") {
      const [model, field] = s.target.split(".");
      stmts.push(`ALTER TABLE "${model}" DROP COLUMN "${field}";`);
    }
    if (s.kind==="DROP_MODEL") {
      stmts.push(`DROP TABLE IF EXISTS "${s.target}" CASCADE;`);
    }
    if (s.kind==="BACKFILL") {
      stmts.push(`-- BACKFILL required for ${s.target} (implement batched UPDATEs).`);
    }
  }
  return stmts.join("\n");
}

/** ---------- Starter snapshots (used if examples missing/empty) ---------- */
const STARTER_OLD: Snapshot = {
  label: "initial",
  prismaVer: "5.0.0",
  models: [
    {
      name: "User",
      fields: [
        { name: "id",    type: "uuid", nullable: false },
        { name: "email", type: "text", nullable: false },
        { name: "name",  type: "text", nullable: true  }
      ],
      indexes: [],
      uniques: []
    }
  ],
  enums: []
};
const STARTER_NEXT: Snapshot = {
  label: "add_profile",
  prismaVer: "5.0.0",
  models: [
    {
      name: "User",
      fields: [
        { name: "id",    type: "uuid", nullable: false },
        { name: "email", type: "text", nullable: false },
        { name: "name",  type: "text", nullable: true  },
        { name: "profileId", type: "int", nullable: true }
      ],
      indexes: [],
      uniques: []
    },
    {
      name: "Profile",
      fields: [
        { name: "id",  type: "int",  nullable: false },
        { name: "bio", type: "text", nullable: true  }
      ],
      indexes: [],
      uniques: []
    }
  ],
  enums: []
};

/** ---------- Handler ---------- */
export async function POST(req: Request) {
  try {
    // Accept optional body: { oldPath: "schemas/old.json", newPath: "schemas/next.json" }
    const body = await (async () => {
      try { return await req.json(); } catch { return {}; }
    })();

    const root = process.cwd();
    const smsmeDir = findSmsmeDir(root);
    const exDir    = path.join(smsmeDir, "examples");
    const planPath = path.join(smsmeDir, "plan.json");
    const sqlPath  = path.join(smsmeDir, "migration.sql");
    ensureDir(exDir);

    // Resolve input snapshot paths
    const dataRoot = path.resolve(root, "../../../data");
    const providedOld = typeof body?.oldPath === "string" && body.oldPath.length > 0;
    const providedNew = typeof body?.newPath === "string" && body.newPath.length > 0;

    const oldPath = providedOld
      ? path.join(dataRoot, String(body.oldPath).replace(/^data[\\/]/, ""))
      : path.join(exDir, "old.json");
    const newPath = providedNew
      ? path.join(dataRoot, String(body.newPath).replace(/^data[\\/]/, ""))
      : path.join(exDir, "next.json");

    // Load snapshots:
    // - If using examples, auto-create starters when missing/empty.
    // - If using provided uploads, require valid JSON (return 400 if missing/invalid).
    let oldSnap: Snapshot | null = safeReadJson(oldPath);
    let newSnap: Snapshot | null = safeReadJson(newPath);

    if (!providedOld && !oldSnap) { oldSnap = STARTER_OLD; writeJson(oldPath, oldSnap); }
    if (!providedNew && !newSnap) { newSnap = STARTER_NEXT; writeJson(newPath, newSnap); }

    if (providedOld && !oldSnap) {
      return NextResponse.json({ ok: false, error: `Invalid or missing JSON at ${oldPath}` }, { status: 400 });
    }
    if (providedNew && !newSnap) {
      return NextResponse.json({ ok: false, error: `Invalid or missing JSON at ${newPath}` }, { status: 400 });
    }

    // diff -> steps
    const steps = diffSnapshots(oldSnap as Snapshot, newSnap as Snapshot);

    // plan object
    const plan: Plan = {
      id: "plan_" + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      status: "DRAFT",
      steps,
      riskSummary: riskSummary(steps)
    };

    // write artifacts
    writeJson(planPath, plan);
    const sql = sqlFromPlan(steps);
    fs.writeFileSync(sqlPath, sql);

    // Return artifacts + summaries for UI preview
    return NextResponse.json({
      ok: true,
      message: "SMSME in-process pipeline complete",
      dir: smsmeDir,
      used: {
        oldPath: oldPath.replace(root + path.sep, ""),
        newPath: newPath.replace(root + path.sep, ""),
        fromUploads: providedOld || providedNew
      },
      planPath: "plan.json",
      sqlPath: "migration.sql",
      risk: plan.riskSummary,
      steps: steps.length,
      plan,   // full plan object for UI
      sql     // raw SQL for download/copy
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
