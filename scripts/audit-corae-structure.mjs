#!/usr/bin/env node
/* plan-first audit for duplicate app trees */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const LOGDIR = path.join(root, ".logs");
const PLAN = [];

function ensureLogDir() { if (!fs.existsSync(LOGDIR)) fs.mkdirSync(LOGDIR, { recursive: true }); }
function exists(p) { return fs.existsSync(p); }
function issue(pathRel, issue, fixCmd) { PLAN.push({ path: pathRel, issue, fixCmd }); }

// Detect dupes at root vs apps/studio
const rootApps = ["apps/ship", "apps/shipyard", "apps/studio"];
for (const rel of rootApps) {
  const p = path.join(root, rel);
  if (exists(p)) {
    // If we detect nested apps/studio/apps/* mark as tidy target
    if (rel === "apps/studio" && exists(path.join(p, "apps"))) {
      issue(rel+"/apps", "nested apps folder (duplicate)", `git rm -r --cached --force ${rel}/apps`);
    }
    // If ship/shipyard at root, suggest move under apps/studio/app if appropriate (manual check)
    if (rel === "apps/ship" || rel === "apps/shipyard") {
      issue(rel, "root-level app tree detected", `# consider: git mv ${rel} apps/studio/${path.basename(rel)}`);
    }
  }
}

ensureLogDir();
fs.writeFileSync(path.join(LOGDIR, "tidy-plan.json"), JSON.stringify(PLAN, null, 2));

console.log("Tidy Plan (read .logs/tidy-plan.json):\n");
for (const row of PLAN) console.log(`- ${row.path}\n  issue: ${row.issue}\n  fix:   ${row.fixCmd}\n`);
if (PLAN.length === 0) console.log("No structural issues found.");
