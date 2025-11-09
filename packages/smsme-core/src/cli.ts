#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";

import { makeSnapshot } from "./snapshot.js";
import { makePlan } from "./planner.js";
import { generateSQL } from "./sql.js";
import { Snapshot, Plan } from "./types.js";

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file: string, obj: unknown) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function ensureDir(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

const [,, cmd, ...rest] = process.argv;

const args = Object.fromEntries(rest.map((a, i, arr) => {
  if (!a.startsWith("--")) return [];
  const k = a.slice(2);
  const v = arr[i+1] && !arr[i+1].startsWith("--") ? arr[i+1] : "true";
  return [k, v];
}).filter(Boolean) as any);

if (cmd === "plan") {
  if (!args.from || !args.to || !args.out) {
    console.error("Usage: plan --from old.json --to next.json --out plan.json");
    process.exit(1);
  }
  const fromRaw = readJson(args.from);
  const toRaw = readJson(args.to);
  const from: Snapshot = makeSnapshot(fromRaw);
  const to: Snapshot = makeSnapshot(toRaw);
  const plan = makePlan(from, to);
  ensureDir(args.out);
  writeJson(args.out, plan);
  console.log(`Plan ${plan.id} written → ${args.out}`);
  process.exit(0);
}

if (cmd === "sql") {
  if (!args.plan || !args.out) {
    console.error("Usage: sql --plan plan.json --out migration.sql");
    process.exit(1);
  }
  const plan: Plan = readJson(args.plan);
  const sql = generateSQL(plan);
  ensureDir(args.out);
  fs.writeFileSync(args.out, sql);
  console.log(`SQL written → ${args.out}`);
  process.exit(0);
}

console.log(`smsme-core
  plan  --from examples/old.json --to examples/next.json --out plan.json
  sql   --plan plan.json --out migration.sql`);