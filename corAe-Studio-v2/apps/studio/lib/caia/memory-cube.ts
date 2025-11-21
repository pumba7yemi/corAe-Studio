import fs from "node:fs";
import path from "node:path";
import { READ_ORDER, isDnaLayer, TenantContext } from "./tenancy";

const MEM_ROOT = path.join(process.cwd(), "memory");
function ensureDir(p: string) { fs.mkdirSync(p, { recursive: true }); }

function fileFor(layer: "global"|"vertical"|"brand"|"tenant", ctx: TenantContext) {
  if (layer === "global")   return path.join(MEM_ROOT, "global",  "core.jsonl");
  if (layer === "vertical") return path.join(MEM_ROOT, "vertical", `${ctx.vertical || "unknown"}.jsonl`);
  if (layer === "brand")    return path.join(MEM_ROOT, "brand",    `${ctx.brand    || "unknown"}.jsonl`);
  return path.join(MEM_ROOT, "tenant",   `${ctx.tenant   || "unknown"}.jsonl`);
}

function appendLine(filePath: string, data: any) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, JSON.stringify(data) + "\n", "utf-8");
}

function readLines(filePath: string) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8").trim();
  if (!raw) return [];
  return raw.split("\n").map(l => JSON.parse(l));
}

export type MemoryEntry = {
  ts?: string;
  layer?: "global"|"vertical"|"brand"|"tenant";
  immutable?: boolean;   // pin DNA entries
  type: string;          // "policy.update" | "workflow.run" | "note" | ...
  note?: string;
  data?: any;
};

export function logToLayer(layer: "global"|"vertical"|"brand"|"tenant", ctx: TenantContext, entry: MemoryEntry) {
  const filePath = fileFor(layer, ctx);
  const withMeta = {
    ts: new Date().toISOString(),
    layer,
    immutable: entry.immutable ?? (layer !== "tenant"),
    ...entry,
  };
  appendLine(filePath, withMeta);
  return withMeta;
}

export function readOverlay(ctx: TenantContext, limit = 200) {
  const files = READ_ORDER.map(l => fileFor(l as any, ctx));
  const all = files.flatMap(f => readLines(f));
  return all.slice(Math.max(0, all.length - limit));
}

export function wipeLayer(layer: "global"|"vertical"|"brand"|"tenant", ctx: TenantContext, force = false) {
  if (isDnaLayer(layer) && !force) throw new Error(`Refusing to wipe DNA layer '${layer}' without force=true`);
  const p = fileFor(layer, ctx);
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, "", "utf-8");
  return { ok: true, wiped: p };
}
