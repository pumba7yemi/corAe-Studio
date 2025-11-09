// apps/studio/lib/notify.ts
// Bridge notifications from workflow runtime -> CIMS in-app messaging

import { send } from "@corae/cims-core";

/**
 * notify(topic, payload)
 * Automatically posts a message to CIMS.
 * Each workflow run ID gets its own dedicated thread.
 */
export async function notify(topic: string, payload: any) {
  const tenantId = payload?.tenantId ?? "demo";
  const actorId = payload?.actorId ?? "system";
  const runId = payload?.runId ?? "general"; // one thread per run
  const subject = `${topic.replaceAll("_", " ")} – ${runId}`;

  await send({
    tenantId,
    senderId: actorId,
    subject,
    threadId: runId,
    body: JSON.stringify(payload, null, 2),
    channel: "inapp",
    meta: { topic }
  });
}
