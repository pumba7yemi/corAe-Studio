import { join, relative } from "path";
import { existsSync } from "fs";
const root = process.cwd();
const moves = [];
const deletes = [];

// Guide: faith/discern
const CANON = [
  "apps/studio/app/home/faith",
  "apps/studio/app/work/faith",
  "apps/studio/app/business/faith",
];
function planMove(from, to) {
  moves.push({ from, to });
}
function planDelete(p) {
  deletes.push(p);
}

// Example proposals (adjust if you have known bad paths):
const bads = [
  "apps/studio/app/ship/faith",
  "apps/studio/app/ship/discern",
  "apps/studio/app/faith",
  "apps/ship/faith",
].map((p) => join(root, p)).filter(existsSync);

for (const b of bads) {
  // propose move into home/faith by default
  const target = join(root, "apps/studio/app/home/faith", relative(join(root, "apps/studio/app/ship"), b));
  planMove(b, target);
}

// Emit plan
console.log("=== corAe Tidy Plan (dry-run) ===");
if (moves.length) {
  console.log("\nMoves:");
  for (const m of moves) console.log(` - MOVE "${m.from}"  ->  "${m.to}"`);
} else console.log("\nMoves: None");
if (deletes.length) {
  console.log("\nDeletes:");
  for (const d of deletes) console.log(` - DELETE "${d}"`);
} else console.log("\nDeletes: None");
console.log("\nApply with: node scripts/tidy-apply.mjs");

export const __plan = { moves, deletes };

