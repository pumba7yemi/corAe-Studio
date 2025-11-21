import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
console.log("Running local nightly sweep…");

const res = spawnSync(process.execPath, [
  path.join(ROOT, "tools", "nightly-green-sweep.mjs")
], { stdio: "inherit", cwd: ROOT });

process.exit(res.status ?? 1);
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(process.cwd());
console.log("Running local nightly sweep…");

const result = spawnSync(process.execPath, [path.join(ROOT, "tools", "nightly-green-sweep.mjs")], {
  stdio: "inherit",
  cwd: ROOT
});

process.exit(result.status ?? 1);
