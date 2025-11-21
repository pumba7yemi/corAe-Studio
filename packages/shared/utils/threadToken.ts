// packages/shared/utils/threadToken.ts
export type Domain = "Business" | "Home" | "Work";
export type Stage  = "Request" | "Booking" | "Active" | "Reporting" | "Invoice";
export type HomeFlowKind = "Bill" | "Admin" | "Personal";
export type WorkFlowKind = "Admin" | "Task";
export type Pipeline = "OBARI" | "HomeFlow" | "WorkFlow";

const up = (s: string) => s.toUpperCase();

export function makeObariToken(domain: Domain, stage: Stage, date = new Date(), seq = 1) {
  const y = date.getFullYear(); const n = String(seq).padStart(4, "0");
  return `E-${up(domain)}-OBARI-${up(stage)}-${y}-${n}`;
}

export function makeHomeFlowToken(flow: HomeFlowKind, date = new Date(), seq = 1) {
  const y = date.getFullYear(); const n = String(seq).padStart(4, "0");
  return `E-HOME-${up(flow)}-${y}-${n}`;
}

export function makeWorkFlowToken(flow: WorkFlowKind, date = new Date(), seq = 1) {
  const y = date.getFullYear(); const n = String(seq).padStart(4, "0");
  return `E-WORK-${up(flow)}-${y}-${n}`;
}

export function isToken(s: string) {
  return /^E-(BUSINESS|HOME|WORK)-(OBARI-(REQUEST|BOOKING|ACTIVE|REPORTING|INVOICE)|(BILL|ADMIN|PERSONAL|TASK))-\d{4}-\d{4}$/.test(s);
}
