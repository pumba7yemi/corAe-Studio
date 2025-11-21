import { readdirSync, statSync } from "fs";
import { join } from "path";
const root = process.cwd();

// 1) Rogue faith/discern anywhere outside allowed roots
const ALLOWED = [
  "apps/studio/app/home/faith",
  "apps/studio/app/work/faith",
  "apps/studio/app/business/faith",
].map((p) => join(root, p));
const startsWithAny = (p, roots) =>
  roots.some((r) => p.startsWith(r + "\\") || p.startsWith(r + "/") || p === r);
const rogue = [];
function scan(dir) {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    // skip common large or recursive directories
    if (e === 'node_modules' || e === '.git' || e === '.next' || e === 'dist' || e === 'build') continue;
    if (statSync(full).isDirectory()) {
      if (/(faith|discern)/i.test(e) && !startsWithAny(full, ALLOWED)) rogue.push(full.replace(root, "."));
      scan(full);
    }
  }
}
scan(join(root, "apps"));

// 2) Duplicate / misplaced apps folders (common error)
const dupApps = [];
function findDupApps(dir, depth = 0) {
  for (const e of readdirSync(dir)) {
  if (e.startsWith('.') || e === 'node_modules') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      if (e === "apps" && depth > 0) dupApps.push(full.replace(root, "."));
      findDupApps(full, depth + (e === "apps" ? 1 : 0));
    }
  }
}
findDupApps(root);

// 3) CAIA packages presence & split
let hasShip = false;
let hasCore = false;
try {
  const pkgs = readdirSync(join(root, "packages"));
  hasShip = pkgs.includes("caia-ship");
  hasCore = pkgs.includes("caia-core");
} catch (e) {
  // ignore
}

// 4) Summarize
console.log("=== corAe Audit ===");
console.log("Rogue faith/discern:", rogue.length ? "\n - " + rogue.join("\n - ") : "None âœ…");
console.log("Duplicate nested 'apps' dirs:", dupApps.length ? "\n - " + dupApps.join("\n - ") : "None âœ…");
console.log("CAIA packages:", { hasShip, hasCore });
console.log("Tip: run scripts/tidy-corae.mjs to generate a safe fix plan.");

// exit 0

