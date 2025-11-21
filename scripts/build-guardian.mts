// scripts/build-guardian.mts
// corAe Build Guardian — enforces a clean TypeScript build before allowing work to continue.

import { execSync } from "node:child_process";

function main() {
  console.log("[BuildGuardian] Running TypeScript workspace build check…");
  try {
    execSync("pnpm -w exec tsc -b --noEmit", {
      stdio: "inherit",
      encoding: "utf8",
    });
    console.log("[BuildGuardian] ✅ TypeScript build is clean (0 errors).");
  } catch (err) {
    console.error(
      "\n[BuildGuardian] ❌ TypeScript build failed. Fix all errors before continuing.\n"
    );
    process.exit(1);
  }
}

main();
