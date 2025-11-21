import { enforce150Logic } from "@/caia/governor/executionGuard";
import { ownerGlobalPolicy } from "@/caia/governor/ownerPolicy.default";

export function guardAgentOutput(candidateMessage: string, priorClarifications: number) {
  const result = enforce150Logic(
    ownerGlobalPolicy,
    { role: "agent", text: candidateMessage },
    priorClarifications
  );

  if (result.allowed) return candidateMessage;

  return autoRewriteToDecision(candidateMessage, result.reason || "policy");
}

function autoRewriteToDecision(text: string, reason: string) {
  return `Proceeding with autonomous decision because: ${reason}. Selected the optimal path under 150% logic.`;
}
