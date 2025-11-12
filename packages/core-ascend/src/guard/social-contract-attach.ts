import { hasSignedSocialContract } from "@/core-ascend/guard/social-contract-check";

/**
 * Attach helper for Ascend flows.
 * Returns an object describing alignment state and a recommended message.
 */
export async function attachSocialContractGuard() {
  const aligned = await hasSignedSocialContract();
  if (aligned) {
    return {
      aligned: true,
      message: "Alignment confirmed — you have mastered conduct, discipline, and respect.",
      event: { type: "ASCEND_ALIGNMENT_CONFIRMED", msg: "User has completed Social Contract alignment — Ascension unlocked." }
    };
  }

  return {
    aligned: false,
    message: "Ascension paused — complete Social Contract audits across Home, Work, and Business.",
  };
}
