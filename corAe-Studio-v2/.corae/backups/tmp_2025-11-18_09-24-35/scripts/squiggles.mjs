#!/usr/bin/env node
import { spawn } from "node:child_process";

const cmd = process.argv[2] || "scan";
const pn = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(bin, args, title) {
  return new Promise((resolve) => {
    console.log(`\n— ${title}`);
    const p = spawn(pn, [bin, ...args], { stdio: "inherit" });
    p.on("close", (code) => resolve(code ?? 0));
  });
}

async function main() {
  if (cmd === "fix") {
    const r1 = await run("exec", ["eslint", ".", "--fix"], "ESLint auto-fix");
    const r2 = await run("run", ["typecheck"], "TypeScript re-check");
    console.log("\n✅ Squiggles fix finished.");
    process.exit(r1 || r2);
  }

  if (cmd === "doctor" || cmd === "scan") {
    const r1 = await run("run", ["typecheck"], "TypeScript check");
    const r2 = await run("exec", ["eslint", "."], "ESLint scan");
    console.log("\n✅ Squiggles scan finished.");
    process.exit(r1 || r2);
  }

  console.log("Usage: node scripts/squiggles.mjs [scan|fix|doctor]");
  process.exit(1);
}
main();