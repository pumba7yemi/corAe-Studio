// packages/shared/utils/pipeline.ts
import type { Domain, Stage, Pipeline, HomeFlowKind, WorkFlowKind } from "./threadToken";

// load @corae/core-clients at runtime if available; otherwise fall back to no-op stubs
const _coreClients = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@corae/core-clients");
  } catch {
    return null;
  }
})();

const findClientByEmailOrDomains = _coreClients?.findClientByEmailOrDomains ?? ((_: string[]) => null);
const getClientById = _coreClients?.getClientById ?? ((_: string | null) => null);

export function inferDomain(subject: string, to: string[], from: string): Domain {
  const s = (subject || "").toLowerCase();
  const all = [from, ...to].join(" ").toLowerCase();
  if (s.includes("[home]") || /home@|family@|school|utility|rent|clinic/.test(all)) return "Home";
  if (s.includes("[work]") || /hr@|rota|training|@work\.os/.test(all)) return "Work";
  return "Business";
}

export function inferStage(subject: string): Stage {
  const s = (subject || "").toLowerCase();
  if (s.includes("invoice") || s.includes("receipt")) return "Invoice";
  if (s.includes("delivery") || s.includes("received") || s.includes("grn")) return "Active";
  if (s.includes("booking") || s.includes("appointment") || s.includes("po") || s.includes("purchase order")) return "Booking";
  if (s.includes("report") || s.includes("reconcile") || s.includes("statement")) return "Reporting";
  return "Request";
}

export function isHomeJob(subject: string, text?: string, obariHint?: boolean): boolean {
  if (obariHint) return true;
  const t = (subject + " " + (text ?? "")).toLowerCase();
  const words = ["quote","quotation","estimate","site visit","appointment","booking","technician","plumber",
    "electrician","ac service","cleaning","pest","maintenance","repair","renovation","delivery","installation",
    "invoice","work order","boq","scope"];
  return words.some(w => t.includes(w));
}

export function inferHomeFlowKind(subject: string, text?: string): HomeFlowKind {
  const t = (subject + " " + (text ?? "")).toLowerCase();
  if (t.includes("bill") || t.includes("due") || t.includes("payment")) return "Bill";
  if (t.includes("school") || t.includes("document") || t.includes("appointment") || t.includes("visa") || t.includes("renewal")) return "Admin";
  return "Personal";
}

export function inferWorkFlowKind(subject: string, text?: string): WorkFlowKind {
  const t = (subject + " " + (text ?? "")).toLowerCase();
  if (t.includes("request") || t.includes("task") || t.includes("update") || t.includes("follow up")) return "Task";
  return "Admin";
}

export function isSignedClientWork(to: string[], from: string, clientId?: string | null): boolean {
  if (clientId) {
    const c = getClientById(clientId);
    return !!(c && c.signed);
  }
  const c2 = findClientByEmailOrDomains([from, ...to]);
  return !!(c2 && c2.signed);
}

export function decidePipeline(domain: Domain, subject: string, text?: string, obariHint?: boolean, to?: string[], from?: string, clientId?: string | null): Pipeline {
  if (domain === "Business") return "OBARI";
  if (domain === "Home") return isHomeJob(subject, text, obariHint) ? "OBARI" : "HomeFlow";
  // Work:
  return isSignedClientWork(to ?? [], from ?? "", clientId) ? "OBARI" : "WorkFlow";
}
