import { decidePipeline, inferDomain, inferStage, inferHomeFlowKind, inferWorkFlowKind } from "../../shared/utils/pipeline";
import { makeObariToken, makeHomeFlowToken, makeWorkFlowToken } from "../../shared/utils/threadToken";
import type { EmailEvent, ThreadCore } from "./types";

const db = new Map<string, ThreadCore>();
let SEQ = 1;

export function upsertThread(ev: EmailEvent): ThreadCore {
  const domain = ev.domain ?? inferDomain(ev.subject, ev.to, ev.from);
  const pipeline = decidePipeline(domain as any, ev.subject, ev.text, ev.obariHint, ev.to, ev.from, ev.clientId);
  const nowISO = new Date().toISOString();
  let threadId = ev.threadId ?? "";

  if (!threadId) {
    if (pipeline === "OBARI") {
      const stage = ev.stage ?? inferStage(ev.subject);
      threadId = makeObariToken(domain as any, stage as any, new Date(ev.date), SEQ++);
    } else if (pipeline === "HomeFlow") {
      const kind = inferHomeFlowKind(ev.subject, ev.text);
      threadId = makeHomeFlowToken(kind, new Date(ev.date), SEQ++);
    } else { // WorkFlow
      const kind = inferWorkFlowKind(ev.subject, ev.text);
      threadId = makeWorkFlowToken(kind, new Date(ev.date), SEQ++);
    }
  }

  const existing = db.get(threadId!);
  const base: ThreadCore = existing ?? {
    threadId: threadId!,
    pipeline,
    domain,
    stage: pipeline === "OBARI" ? (ev.stage ?? inferStage(ev.subject)) : undefined,
    homeFlowKind: pipeline === "HomeFlow" ? inferHomeFlowKind(ev.subject, ev.text) : undefined,
    workFlowKind: pipeline === "WorkFlow" ? inferWorkFlowKind(ev.subject, ev.text) : undefined,
    status: "Open",
    subject: ev.subject,
    participants: Array.from(new Set([ev.from, ...ev.to, ...(ev.cc ?? [])])),
    lastUpdateISO: nowISO,
    relatedTasks: [],
    messages: [],
    attachments: [],
  };

  base.pipeline = pipeline;
  base.domain = domain;
  base.stage = pipeline === "OBARI" ? (ev.stage ?? inferStage(ev.subject)) : undefined;
  base.homeFlowKind = pipeline === "HomeFlow" ? inferHomeFlowKind(ev.subject, ev.text) : undefined;
  base.workFlowKind = pipeline === "WorkFlow" ? inferWorkFlowKind(ev.subject, ev.text) : undefined;
  base.subject = base.subject || ev.subject;
  base.lastUpdateISO = nowISO;
  base.participants = Array.from(new Set([...base.participants, ev.from, ...ev.to, ...(ev.cc ?? [])]));
  base.messages.push({
    direction: ev.direction,
    messageId: ev.messageId,
    date: ev.date,
    from: ev.from,
    to: ev.to,
    cc: ev.cc,
    subject: ev.subject,
  });

  db.set(threadId!, base);
  return base;
}

// expose for dev tooling
// @ts-ignore
export const __DB__ = db;