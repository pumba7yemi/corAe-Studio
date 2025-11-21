import type { OwnerPolicy } from "./policy";

export interface AgentMessage {
  role: "agent" | "owner";
  text: string;
}

export interface GuardResult {
  allowed: boolean;
  reason?: string;
}

export function enforce150Logic(
  policy: OwnerPolicy,
  msg: AgentMessage,
  priorClarifications: number
): GuardResult {
  if (msg.role !== "agent") return { allowed: true };

  const text = msg.text.trim();

  if (policy.decisionMode === "EXECUTE" && !policy.allowOptions) {
    const looksLikeOptions =
      /\boption\b|\bwould you like\b|\bwhich do you prefer\b|\bchoose\b|\bselect\b/i.test(text);

    if (looksLikeOptions) {
      return {
        allowed: false,
        reason: "EXECUTE mode: options are not permitted."
      };
    }
  }

  const isQuestion = text.endsWith("?");

  if (isQuestion && priorClarifications >= policy.maxClarifications) {
    return {
      allowed: false,
      reason: "Clarification limit reached — agent must choose a path."
    };
  }

  return { allowed: true };
}
