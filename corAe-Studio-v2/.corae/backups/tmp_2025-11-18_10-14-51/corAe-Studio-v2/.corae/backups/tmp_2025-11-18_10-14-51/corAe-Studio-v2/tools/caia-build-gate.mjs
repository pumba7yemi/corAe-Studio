import { routeIntent } from "./structure-router.mjs";

export function structuralGate(input) {
  const r = routeIntent(input);

  if (r.found && r.action === "extend-existing") {
    return {
      allowed: false,
      reason: `Structural Intelligence: '${input}' already exists in ${r.targetDomain}. Do NOT create duplicates.`,
      domain: r.targetDomain
    };
  }

  if (!r.found) {
    return {
      allowed: false,
      reason: "Structural Intelligence: Clarification required before placing in corAe.",
      domain: null
    };
  }

  return { allowed: true };
}
