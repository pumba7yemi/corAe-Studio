// scripts/nightly-build.mts
// Nightly build checker for corAe-Studio. Writes a JSON report of build health.

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function runNightly() {
  const startedAt = new Date().toISOString();
  const root = process.cwd();
  const reportDir = join(root, "var", "nightly");
  mkdirSync(reportDir, { recursive: true });

  let success = false;
  let output = "";

  try {
    output = execSync("pnpm -w exec tsc -b --noEmit", {
      encoding: "utf8",
      stdio: "pipe",
    });
    success = true;
  } catch (err: any) {
    const stdout = err?.stdout ? String(err.stdout) : "";
    const stderr = err?.stderr ? String(err.stderr) : "";
    output = stdout + (stderr ? "\n" + stderr : "");
    success = false;
  }

  const finishedAt = new Date().toISOString();
  const fileName = `build-${startedAt.replace(/[:.]/g, "-")}.json`;
  const reportPath = join(reportDir, fileName);

  const report = {
    startedAt,
    finishedAt,
    success,
    command: "pnpm -w exec tsc -b --noEmit",
    output,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  if (!success) {
    console.error("[Nightly] ❌ Build failed. Report:", reportPath);
    process.exit(1);
  } else {
    console.log("[Nightly] ✅ Build OK. Report:", reportPath);
  }
}

runNightly();
