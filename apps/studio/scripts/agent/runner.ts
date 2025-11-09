// apps/studio/scripts/agent/runner.ts
import path from "node:path";
import { promises as fs } from "node:fs";

// IMPORTANT: use relative imports (no @/lib) because ts-node doesn't read Next/tsconfig aliases.
import { tick } from "../../lib/workflows/runtime";
import { RAM } from "../../lib/memory";

async function main() {
  const runId = process.argv[2] || "tenant:flow:demo";
  const specName = process.argv[3] || "corae.flow.json";

  // Resolve repo root: from this file (apps/studio/scripts/agent) up to repo root
  const repoRoot = path.resolve(__dirname, "../../../..");
  const specPath = path.join(
    repoRoot,
    "packages",
    "workflows-core",
    "specs",
    specName
  );

  // Load spec JSON
  const specRaw = await fs.readFile(specPath, "utf8");
  const spec = JSON.parse(specRaw);

  // Ensure state exists
  const stateKey = "wf.state";
  const existing = (await RAM.get(runId, stateKey)) as any;
  if (!existing) {
    await RAM.set(runId, stateKey, { i: 0, approvals: {} });
  }

  // Single tick
  const res = await tick(runId, spec);
  console.log(JSON.stringify({ runId, result: res }, null, 2));
}

main().catch((e) => {
  console.error("[agent-runner] fatal:", e?.message || e);
  process.exit(1);
});
