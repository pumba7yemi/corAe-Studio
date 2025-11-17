// CIMS Auto-Sync (ESM) — file-backed notifier for CIMS + WhatsApp
// Stores messages as JSON under .data/cims-messages/
//
// Channels: "CIMS" (internal), "WhatsApp" (simulated)
// No external deps.

import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve as pathResolve, join as pathJoin } from "node:path";

const STORE = pathResolve(process.cwd(), ".data", "cims-messages");

/** @typedef {"CIMS"|"WhatsApp"} SyncChannel */
/**
 * @typedef {Object} SyncMessage
 * @property {string=} id
 * @property {SyncChannel} channel
 * @property {string} from
 * @property {string} to
 * @property {string} subject
 * @property {string} body
 * @property {Record<string, any>=} meta
 */

/** @param {SyncMessage} msg */
async function persistMessage(msg) {
  await mkdir(STORE, { recursive: true });
  const id = msg.id ?? randomUUID();
  const full = { ...msg, id, createdAt: new Date().toISOString() };
  const file = pathJoin(STORE, `${id}.json`);
  await writeFile(file, JSON.stringify(full, null, 2), "utf8");
  return { id, file };
}

/** @param {Omit<SyncMessage,"channel">} msg */
export async function pushToCIMS(msg) {
  const payload = { ...msg, channel: "CIMS" };
  const stored = await persistMessage(payload);
  console.log("📨 [CIMS]", payload.subject);
  return stored;
}

/** @param {Omit<SyncMessage,"channel">} msg */
export async function pushToWhatsApp(msg) {
  const payload = { ...msg, channel: "WhatsApp" };
  const stored = await persistMessage(payload);
  console.log("💬 [WhatsApp]", payload.subject);
  return stored;
}

/**
 * Notify when survey DRAFT is submitted.
 * @param {{surveyId:string, party:{type:string, name?:string, contact?:any}, responses:Record<string,any>}} p
 */
export async function notifySurveySubmit(p) {
  const subj = `BTDO Survey Submitted — ${p.party?.name ?? "Unknown Party"}`;
  const body =
    `A ${p.party?.type} survey has been submitted.\n\n` +
    `Survey ID: ${p.surveyId}\n\nDetails:\n${JSON.stringify(p.responses ?? {}, null, 2)}`;

  const cims = await pushToCIMS({
    from: "CAIA",
    to: "Ops",
    subject: subj,
    body,
    meta: { surveyId: p.surveyId },
  });

  if (p.party?.contact?.phone) {
    await pushToWhatsApp({
      from: "CAIA",
      to: p.party.contact.phone,
      subject: "Survey Received ✅",
      body: `Hi ${p.party.name ?? ""}, we’ve received your survey submission. Our team will review and confirm shortly.`,
      meta: { surveyId: p.surveyId },
    });
  }

  return { ok: true, cims };
}

/**
 * Notify when quote is ACCEPTED (BDO ready).
 * @param {{surveyId:string, party:{type:string, name?:string, contact?:any}, bdoCode:string}} p
 */
export async function notifySurveyAccept(p) {
  const subj = `BDO Ready — ${p.party?.name ?? "Untitled"} (${p.bdoCode})`;
  const body =
    `The quote for ${p.party?.name ?? "Unknown"} has been accepted.\n\n` +
    `Survey ID: ${p.surveyId}\nBDO Code: ${p.bdoCode}\n\nProceed to scheduling.`;

  const cims = await pushToCIMS({
    from: "CAIA",
    to: "Ops",
    subject: subj,
    body,
    meta: { surveyId: p.surveyId, bdoCode: p.bdoCode },
  });

  if (p.party?.contact?.phone) {
    await pushToWhatsApp({
      from: "CAIA",
      to: p.party.contact.phone,
      subject: "Quote Accepted 🤝",
      body: `Hi ${p.party.name ?? ""}, your quote has been accepted. Order code: ${p.bdoCode}. We'll contact you with scheduling info.`,
      meta: { surveyId: p.surveyId, bdoCode: p.bdoCode },
    });
  }

  return { ok: true, cims };
}