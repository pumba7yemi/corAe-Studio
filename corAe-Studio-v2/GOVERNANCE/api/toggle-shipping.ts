import fs from "node:fs";
import path from "node:path";
import { logGovernanceEvent } from "../tools/governance-log.mts";

const V2_ROOT = process.cwd();
const TOGGLE_PATH = path.join(V2_ROOT, "corAe-Studio-v2", "GOVERNANCE", "core", "shipping-allowed.json");

export function handleToggleShipping(allow: boolean) {
  const next = { "//": "corAe Build Governance — Only allow shipping if set to true", allowShipping: allow };
  fs.writeFileSync(TOGGLE_PATH, JSON.stringify(next, null, 2));
  logGovernanceEvent({
    actor: "system",
    kind: allow ? "ship-allowed" : "ship-blocked",
    reason: allow ? "toggle ON" : "toggle OFF"
  });
  return next;
}
