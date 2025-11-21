// /scripts/law.enforce.ts
// corAe Build Guard — runs the constitutional validator before any build.
// Windows-first; no repo imports to avoid alias issues.
//
// Usage (wire as prebuild):
//   "prebuild": "tsx scripts/law.enforce.ts"

import { spawnSync } from "node:child_process";

function runValidate(): number {
  const isWin = process.platform === "win32";
  const cmd = isWin ? "npx.cmd" : "npx";
  const args = ["tsx", "scripts/law.validate.ts"];

  const res = spawnSync(cmd, args, {
    stdio: "inherit", // stream validator output directly (JSON summary)
    shell: false,
  });

  // If spawn itself failed (e.g., tsx missing), guide the user with a non-zero exit.
  if (res.error) {
    console.error(
      "[corAe] Failed to execute validator. Ensure dev deps include 'tsx'. Error:",
      res.error.message
    );
    return 1;
  }

  // Propagate validator exit code (0 = OK, 1 = violations)
  return typeof res.status === "number" ? res.status : 1;
}

const exitCode = runValidate();
if (exitCode !== 0) {
  console.error(
    "\n[corAe] Build blocked by constitutional law violations. " +
      "See the JSON summary above for details.\n"
  );
  process.exit(exitCode);
}