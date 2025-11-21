// corAe · CIMS Sync Helper
// Purpose: auto-send structured messages to internal CIMS + WhatsApp
// Imported by BTDO survey routes (submit/accept) and later OBARI Order stages

import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

const STORE = pathResolve(process.cwd(), ".data", "cims-messages");

export type SyncChannel = "CIMS" | "WhatsApp";

export interface SyncMessage {
  id?: string;
  channel: SyncChannel;
  from: string;
  to: string;
  subject: string;
  body: string;
  meta?: Record<string, any>;
}

/* ───────────────────────────────
   Internal helper
─────────────────────────────── */
async function persistMessage(msg: SyncMessage) {
  await mkdir(STORE, { recursive: true });
  const id = msg.id ?? randomUUID();
  const full = { ...msg, id, createdAt: new Date().toISOString() };
  const file = pathJoin(STORE, `${id}.json`);
  await writeFile(file, JSON.stringify(full, null, 2), "utf8");
  return { id, file };
}

/* ───────────────────────────────
   Public API
─────────────────────────────── */
export async function pushToCIMS(msg: Omit<SyncMessage, "channel">) {
  const payload: SyncMessage = { ...msg, channel: "CIMS" };
  const stored = await persistMessage(payload);
  console.log("📨 [CIMS]", payload.subject);
  return stored;
}

export async function pushToWhatsApp(msg: Omit<SyncMessage, "channel">) {
  const payload: SyncMessage = { ...msg, channel: "WhatsApp" };
  const stored = await persistMessage(payload);
  console.log("💬 [WhatsApp]", payload.subject);
  return stored;
}

/* ───────────────────────────────
   Convenience wrappers for BTDO
─────────────────────────────── */
export async function notifySurveySubmit({
  surveyId,
  party,
  responses,
}: {
  surveyId: string;
  party: { type: string; name?: string; contact?: any };
  responses: Record<string, any>;
}) {
  const subj = `BTDO Survey Submitted — ${party.name ?? "Unknown Party"}`;
  const body = `A ${party.type} survey has been submitted.\n\nSurvey ID: ${surveyId}\n\nDetails:\n${JSON.stringify(
    responses,
    null,
    2
  )}`;

  const cims = await pushToCIMS({
    from: "CAIA",
    to: "Ops",
    subject: subj,
    body,
    meta: { surveyId },
  });

  if (party?.contact?.phone) {
    await pushToWhatsApp({
      from: "CAIA",
      to: party.contact.phone,
      subject: "Survey Received ✅",
      body: `Hi ${party.name}, we’ve received your survey submission. Our team will review and confirm shortly.`,
      meta: { surveyId },
    });
  }

  return { ok: true, cims };
}

export async function notifySurveyAccept({
  surveyId,
  party,
  bdoCode,
}: {
  surveyId: string;
  party: { type: string; name?: string; contact?: any };
  bdoCode: string;
}) {
  const subj = `BDO Ready — ${party.name ?? "Untitled"} (${bdoCode})`;
  const body = `The quote for ${party.name} has been accepted.\n\nSurvey ID: ${surveyId}\nBDO Code: ${bdoCode}\n\nProceed to scheduling.`;

  const cims = await pushToCIMS({
    from: "CAIA",
    to: "Ops",
    subject: subj,
    body,
    meta: { surveyId, bdoCode },
  });

  if (party?.contact?.phone) {
    await pushToWhatsApp({
      from: "CAIA",
      to: party.contact.phone,
      subject: "Quote Accepted 🤝",
      body: `Hi ${party.name}, your quote has been accepted. Order code: ${bdoCode}. We'll contact you with scheduling info.`,
      meta: { surveyId, bdoCode },
    });
  }

  return { ok: true, cims };
}
