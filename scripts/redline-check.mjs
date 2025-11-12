#!/usr/bin/env node
// Orchestrates guardrail + typecheck + libs build + studio build.
// Stops on FIRST error with a concise message.

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const log = (m) => console.log(`\n▶ ${m}`);
const run = (cmd, opts = {}) => execSync(cmd, { stdio: "inherit", ...opts });

const fail = (msg) => {
  console.error(`\n⛔ ${msg}`);
  process.exit(1);
};

try {
  // 0) Git hygiene
  log("git status — ensure clean working tree");
  const dirty = execSync("git status --porcelain").toString().trim();
  if (dirty) fail("Working tree not clean. Commit/stash first.");

  // 1) Single workspace file + includes apps/* and packages/*
  log("workspace check — pnpm-workspace.yaml");
  const wsRoot = join(ROOT, "pnpm-workspace.yaml");
  if (!existsSync(wsRoot)) fail("pnpm-workspace.yaml missing at repo root.");
  const ws = readFileSync(wsRoot, "utf8");
  if (!/packages:\s*[\s\S]*- +"apps\/\*"/.test(ws) || !/packages:\s*[\s\S]*- +"packages\/\*"/.test(ws)) {
    fail("pnpm-workspace.yaml must include packages: ['apps/*','packages/*'].");
  }

  // 2) Lockfile sanity (attempt install with frozen lockfile)
  log("lockfile check — pnpm install --frozen-lockfile");
  run("pnpm -w install --frozen-lockfile");

  // 3) Static guardrails
  log("guardrail: casing");
  run("node scripts/check-casing.mjs");
  log("guardrail: deep-imports");
  run("node scripts/check-deep-imports.mjs");
  log("guardrail: next directives");
  run("node scripts/check-next-directives.mjs");
  log("guardrail: prisma layout");
  run("node scripts/check-prisma-layout.mjs");
  log("guardrail: env keys");
  run("node scripts/check-env.mjs");

  // 4) Build pipeline (typecheck -> libs -> studio)
  log("tsc composite typecheck (no emit)");
  run("pnpm -w exec tsc -b --noEmit");

  log("build libs (order matters)");
  const libs = ["@corae/caia-core", "@corae/core-ascend", "@corae/bdo-core"];
  for (const lib of libs) {
    try {
      run(`pnpm --filter ${lib} build`);
    } catch (e) {
      fail(`Library build failed: ${lib}. Fix single file reported above, then re-run.`);
    }
  }

  log("build studio");
  run("pnpm --filter @corae/studio build");

  console.log("\n✅ Redline check PASSED: typecheck ✔ libs ✔ studio ✔");
} catch (e) {
  // If a child process already printed errors, just exit.
  if (e?.status) process.exit(e.status);
  fail(e?.message || "Unknown error");
}
