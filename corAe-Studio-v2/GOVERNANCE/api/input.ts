import { evaluateInputGovernance } from "../tools/governance-guard.mts";
export function handleInput(message: string) {
  return evaluateInputGovernance(message);
}
