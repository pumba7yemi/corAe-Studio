#!/usr/bin/env node
/* apply the last tidy plan if CAIA_TIDY_AUTO=1 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const auto = process.env.CAIA_TIDY_AUTO === "1";
const planPath = ".logs/tidy-plan.json";
if (!fs.existsSync(planPath)) {
  console.error("No plan found. Run: node scripts/audit-corae-structure.mjs");
  process.exit(1);
}
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
if (!auto) {
  console.log("Dry-run only. Set CAIA_TIDY_AUTO=1 to apply.");
  console.log(plan);
  process.exit(0);
}

for (const row of plan) {
  const cmd = row.fixCmd;
  if (!cmd || cmd.startsWith("#")) continue; // manual items are commented
  console.log("APPLY:", cmd);
  execSync(cmd, { stdio: "inherit" });
}
console.log("Tidy apply complete.");
// NOTE: This helper intentionally does not auto-apply moves. It reads the plan and prints
// git mv commands for manual review. Use with care.
const tidyModule = await import("./tidy-corae.mjs").catch(() => null);
if (!tidyModule || !tidyModule.__plan) {
  console.log("No plan found. Run: node scripts/tidy-corae.mjs");
  process.exit(0);
}
const { moves, deletes } = tidyModule.__plan;
console.log("=== tidy-apply (DRY) ===");
for (const m of moves) console.log(`git mv -v "${m.from}" "${m.to}"`);
for (const d of deletes) console.log(`git rm -r --cached "${d}" || rm -rf "${d}"`);
console.log("\nReview and run the git mv commands manually to preserve history.");
