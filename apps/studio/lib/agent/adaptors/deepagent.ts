const BASE = process.env.ABACUS_BASE_URL!;
const KEY  = process.env.ABACUS_API_KEY!;

/**
 * DeepAgent adaptor
 * - Sends message to Abacus.AI DeepAgent
 * - Returns DeepAgentResponse JSON
 */
export async function deepagentRespond(message: string, conversationId?: string) {
  const res = await fetch(`${BASE}/getDeepAgentResponse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": KEY
    },
    body: JSON.stringify({
      message,
      deploymentConversationId: conversationId
    })
  });

  if (!res.ok) {
    throw new Error(`DeepAgent adaptor failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}