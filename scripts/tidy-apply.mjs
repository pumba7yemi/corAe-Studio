import { promises as fs } from "fs";
import { dirname } from "path";
// NOTE: This helper intentionally does not auto-apply moves. It reads the plan and prints
// git mv commands for manual review. Use with care.
const plan = await import("./tidy-corae.mjs").catch(() => null);
if (!plan || !plan.__plan) {
  console.log("No plan found. Run: node scripts/tidy-corae.mjs");
  process.exit(0);
}
const { moves, deletes } = plan.__plan;
console.log("=== tidy-apply (DRY) ===");
for (const m of moves) console.log(`git mv -v "${m.from}" "${m.to}"`);
for (const d of deletes) console.log(`git rm -r --cached "${d}" || rm -rf "${d}"`);
console.log("\nReview and run the git mv commands manually to preserve history.");
