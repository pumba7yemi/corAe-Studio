import { readFileSync } from "node:fs";
import path from "node:path";

export type WorkflowSpec = Record<string, any>;

export function registerMarketingLoop(load: (spec: WorkflowSpec) => void) {
  const specPath = path.join(
    process.cwd(),
    "packages/workflows-core/specs/marketing.loop.json"
  );
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  load(spec);
}
