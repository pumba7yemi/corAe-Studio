/* tools/shipyard/scan-and-plan.ts
 * corAe Shipyard/Dockyard Tidy — Scan & Plan (read-only)
 * - Scans monorepo for duplicates, near-duplicates, orphans, and route collisions
 * - Writes a plan.json under /tools/shipyard/out/ (no file moves or deletions)
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type FileInfo = {
  abs: string;
  rel: string;
  size: number;
  hash: string;
  ext: string;
  imports: string[];
};

type Plan = {
  generatedAt: string;
  root: string;
  duplicates: { hash: string; files: string[] }[];
  nearDuplicates: { filename: string; files: string[] }[];
  orphans: string[];
  routeCollisions: { segment: string; routes: string[] }[];
  suggestedMoves: { from: string; to: string; reason: string }[];
  suggestedDeletes: { target: string; reason: string }[];
  notes: string[];
};

const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, "tools", "shipyard", "out");
const INCLUDE_DIRS = [
  "apps/core",
  "apps/home",
  "apps/work",
  "apps/business",
  "apps/studio", // legacy to be split into apps/shipyard + tools/shipyard
  "packages",
  "tools",
];

const IGNORE_DIRS = [
  "node_modules",
  ".next",
  ".turbo",
  "dist",
  "build",
  ".git",
  "out",
];

const CODE_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".md",
]);

const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".md", ".json", ".css", ".scss"]);

function isIgnored(p: string) {
  return IGNORE_DIRS.some((ban) => p.split(path.sep).includes(ban));
}

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (isIgnored(abs)) continue;
    if (e.isDirectory()) walk(abs, acc);
    else acc.push(abs);
  }
  return acc;
}

function sha1(buf: Buffer) {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function readTextSafe(abs: string) {
  try {
    return fs.readFileSync(abs, "utf8");
  } catch {
    return "";
  }
}

function extractImports(text: string): string[] {
  const lines = text.split(/\r?\n/);
  const imports: string[] = [];
  const re = /^\s*import\s+(?:["'\w{}\*\s,]+)\s+from\s+["']([^"']+)["'];?\s*$/;
  const re2 = /^\s*import\s+["']([^"']+)["'];?\s*$/;
  for (const ln of lines) {
    const m = ln.match(re) || ln.match(re2);
    if (m) imports.push(m[1]);
  }
  return imports;
}

// Rough near-dup measure: same basename + >=80% line overlap (bag-of-lines)
function isNearDuplicate(a: string, b: string) {
  const A = new Set(a.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  const B = new Set(b.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  if (A.size === 0 || B.size === 0) return false;
  let overlap = 0;
  for (const t of A) if (B.has(t)) overlap++;
  const ratioA = overlap / A.size;
  const ratioB = overlap / B.size;
  return Math.max(ratioA, ratioB) >= 0.8;
}

function rel(p: string) {
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function gatherFiles(): FileInfo[] {
  const files: FileInfo[] = [];
  for (const base of INCLUDE_DIRS) {
    const absBase = path.join(ROOT, base);
    const all = walk(absBase);
    for (const abs of all) {
      const ext = path.extname(abs);
      if (!CODE_EXT.has(ext)) continue;
      const buf = fs.readFileSync(abs);
      const hash = sha1(buf);
      const text = TEXT_EXT.has(ext) ? buf.toString("utf8") : "";
      const imports = TEXT_EXT.has(ext) ? extractImports(text) : [];
      files.push({
        abs,
        rel: rel(abs),
        size: buf.length,
        hash,
        ext,
        imports,
      });
    }
  }
  return files;
}

function buildImportIndex(files: FileInfo[]) {
  const byRel: Record<string, FileInfo> = {};
  for (const f of files) byRel[f.rel] = f;

  const inbound: Record<string, number> = {};
  files.forEach((f) => (inbound[f.rel] = 0));

  // naive: count string occurrences of relative or package-style paths
  const relIndex = new Map<string, string[]>(); // basename -> rel paths
  for (const f of files) {
    const base = path.basename(f.rel);
    const arr = relIndex.get(base) || [];
    arr.push(f.rel);
    relIndex.set(base, arr);
  }

  for (const f of files) {
    for (const imp of f.imports) {
      // attempt resolve by filename matches (loose heuristic)
      const guess = relIndex.get(path.basename(imp + (path.extname(imp) ? "" : ".ts"))) || [];
      for (const g of guess) {
        if (byRel[g]) inbound[g] = (inbound[g] || 0) + 1;
      }
    }
  }
  return inbound;
}

function findDuplicates(files: FileInfo[]) {
  const map = new Map<string, string[]>();
  for (const f of files) {
    const arr = map.get(f.hash) || [];
    arr.push(f.rel);
    map.set(f.hash, arr);
  }
  return [...map.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([hash, arr]) => ({ hash, files: arr.sort() }));
}

function findNearDuplicates(files: FileInfo[]) {
  const byName = new Map<string, FileInfo[]>();
  for (const f of files) {
    const base = path.basename(f.rel);
    const arr = byName.get(base) || [];
    arr.push(f);
    byName.set(base, arr);
  }
  const out: { filename: string; files: string[] }[] = [];
  for (const [filename, arr] of byName) {
    if (arr.length < 2) continue;
    const pairs: string[][] = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const A = readTextSafe(arr[i].abs);
        const B = readTextSafe(arr[j].abs);
        if (isNearDuplicate(A, B)) {
          pairs.push([arr[i].rel, arr[j].rel]);
        }
      }
    }
    if (pairs.length) {
      const flat = [...new Set(pairs.flat())].sort();
      out.push({ filename, files: flat });
    }
  }
  return out;
}

function findOrphans(files: FileInfo[]) {
  const inbound = buildImportIndex(files);
  // ignore route/page/layout files from orphaning (they’re expected entrypoints)
  const isRouteEntry = (f: string) =>
    /\/app\/.*\/(page|layout|route)\.(t|j)sx?$/.test(f);

  return files
    .map((f) => f.rel)
    .filter((rel) => !isRouteEntry(rel))
    .filter((rel) => (inbound[rel] || 0) === 0)
    .sort();
}

function findRouteCollisions(files: FileInfo[]) {
  // Check for duplicate shipped segments under app/**/ship/**
  const shipRoutes = files
    .map((f) => f.rel)
    .filter((r) => /\/app\/ship\//.test(r))
    .filter((r) => /(page|route)\.(t|j)sx?$/.test(r));

  // Map segment -> routes
  const segMap = new Map<string, string[]>();
  for (const r of shipRoutes) {
    const segment = r.replace(/.*\/app\/ship\//, "").replace(/\/(page|route)\.(t|j)sx?$/, "");
    const arr = segMap.get(segment) || [];
    arr.push(r);
    segMap.set(segment, arr);
  }
  const collisions: { segment: string; routes: string[] }[] = [];
  for (const [segment, routes] of segMap) {
    if (routes.length > 1) collisions.push({ segment, routes: routes.sort() });
  }
  return collisions.sort((a, b) => a.segment.localeCompare(b.segment));
}

function suggestMoves(files: FileInfo[]): { from: string; to: string; reason: string }[] {
  const moves: { from: string; to: string; reason: string }[] = [];
  // Studio → Shipyard/Dockyard mapping (suggestions only)
  for (const f of files) {
    if (f.rel.startsWith("apps/studio/app/")) {
      // UI routes should live in apps/shipyard
      moves.push({
        from: f.rel,
        to: f.rel.replace(/^apps\/studio/, "apps/shipyard"),
        reason: "Studio UI → Shipyard UI (apps/shipyard)",
      });
    } else if (f.rel.startsWith("apps/studio/scripts/")) {
      // Scripts should live in tools/shipyard
      moves.push({
        from: f.rel,
        to: f.rel.replace(/^apps\/studio\/scripts/, "tools/shipyard"),
        reason: "Studio scripts → Shipyard scripts (tools/shipyard)",
      });
    }
  }
  return moves;
}

function suggestDeletes(duplicates: { hash: string; files: string[] }[]) {
  // For each duplicate group, suggest keeping the first path by lexical order
  const del: { target: string; reason: string }[] = [];
  for (const grp of duplicates) {
    const keep = grp.files[0];
    for (const f of grp.files.slice(1)) {
      del.push({ target: f, reason: `Duplicate of ${keep} (same hash)` });
    }
  }
  return del;
}

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function main() {
  const files = gatherFiles();
  const duplicates = findDuplicates(files);
  const nearDuplicates = findNearDuplicates(files);
  const orphans = findOrphans(files);
  const routeCollisions = findRouteCollisions(files);
  const moves = suggestMoves(files);
  const deletes = suggestDeletes(duplicates);

  const plan: Plan = {
    generatedAt: new Date().toISOString(),
    root: ROOT,
    duplicates,
    nearDuplicates,
    orphans,
    routeCollisions,
    suggestedMoves: moves,
    suggestedDeletes: deletes,
    notes: [
      "This is a READ-ONLY plan. No files were modified.",
      "Review suggestedMoves and suggestedDeletes before applying.",
      "After approval, run the apply script (to be added next) to perform controlled moves/deletes with Git safety.",
      "apps/studio is considered legacy and will be split into apps/shipyard (UI) and tools/shipyard (scripts).",
      "tools/dockyard is for staging/packaging shipped artifacts (CI, smoke tests, manifests).",
    ],
  };

  ensureOutDir();
  const outFile = path.join(OUT_DIR, "plan.json");
  fs.writeFileSync(outFile, JSON.stringify(plan, null, 2));

  // Console summary
  const summary = {
    files: files.length,
    duplicates: duplicates.length,
    nearDuplicates: nearDuplicates.length,
    orphans: orphans.length,
    routeCollisions: routeCollisions.length,
    suggestedMoves: moves.length,
    suggestedDeletes: deletes.length,
  };
  // eslint-disable-next-line no-console
  console.table([summary]);
  // eslint-disable-next-line no-console
  console.log(`\nPlan written to: ${rel(outFile)}\n`);
}

main();
