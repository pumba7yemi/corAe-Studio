import { prisma } from "@/lib/prisma";

/* ───────────────────────── Types ───────────────────────── */

export type StepName =
  | "lead"
  | "btdo.intake"
  | "btdo.accept"
  | "bdo.pricelock"
  | "bdo.contract"          // optional if you still keep it
  | "bdo.booking-sheet"
  | "bdo.documentation"
  | "bdo.activate";

type ChronoScope =
  | "GENERAL"
  | "WORKFLOWS"
  | "OPERATIONS"
  | "HR"
  | "FINANCE"
  | "MARKETING"
  | "SALES";

type Gateway =
  | "BTDO"
  | "BDO_READY"
  | "CONTRACTED"
  | "BDO_CONFIRMED"
  | "DOCUMENTED"
  | "ACTIVE";

/** Minimal payload snapshot stored alongside chrono entries for quick forensic review. */
export interface Snapshot {
  summary?: string;
  payload?: Record<string, any>;
}

/* ───────────────────────── Labels & Maps ───────────────────────── */

const STEP_LABEL: Record<StepName, string> = {
  lead: "Lead",
  "btdo.intake": "BTDO Intake",
  "btdo.accept": "Quote Acceptance",
  "bdo.pricelock": "Pricelock",
  "bdo.contract": "Contract",
  "bdo.booking-sheet": "Booking Sheet",
  "bdo.documentation": "Documentation",
  "bdo.activate": "Activate",
};

const STEP_SCOPE: Record<StepName, ChronoScope> = {
  lead: "SALES",
  "btdo.intake": "OPERATIONS",
  "btdo.accept": "OPERATIONS",
  "bdo.pricelock": "FINANCE",
  "bdo.contract": "OPERATIONS",
  "bdo.booking-sheet": "OPERATIONS",
  "bdo.documentation": "OPERATIONS",
  "bdo.activate": "WORKFLOWS",
};

/** What gateway a step is *expected* to satisfy (or move toward). */
const STEP_GATE: Partial<Record<StepName, Gateway>> = {
  "btdo.intake": "BTDO",
  "btdo.accept": "BDO_READY",
  "bdo.contract": "CONTRACTED",
  "bdo.booking-sheet": "BDO_CONFIRMED",
  "bdo.documentation": "DOCUMENTED",
  "bdo.activate": "ACTIVE",
};

/* ───────────────────────── Public API ───────────────────────── */

/**
 * Write a standardized Chrono record for a wizard step save.
 * Will safely no-op if `chrono` table isn't migrated yet.
 */
export async function logStepSaved(opts: {
  step: StepName;
  dealId: string;
  refId?: string;                 // e.g., quoteId, pricelock chain id, etc.
  contactId?: string | null;
  message?: string;               // custom note to append
  snapshot?: Snapshot;            // small payload summary
}) {
  const { step, dealId, refId, contactId, message, snapshot } = opts;
  const scope = STEP_SCOPE[step] ?? "WORKFLOWS";
  const auto = `Step saved: ${STEP_LABEL[step]}${refId ? ` • ref=${refId}` : ""}.`;
  const finalMsg = message ? `${auto} ${message}` : auto;

  await safeChrono({
    scope,
    message: finalMsg,
    refType: "Deal",
    refId: dealId,
    dealId,
    contactId: contactId || undefined,
    snapshot,
  });
}

/**
 * Log a gateway audit (pass/fail + missing) and return a human-readable message.
 * Use right after you validate a transition in your route handler.
 */
export async function logGatewayAudit(opts: {
  dealId: string;
  gateway: Gateway;
  ok: boolean;
  missing?: string[] | string | null;
  byContactId?: string | null;
  context?: Record<string, any>;
}) {
  const { dealId, gateway, ok, missing, byContactId, context } = opts;
  const miss = Array.isArray(missing) ? missing.filter(Boolean) : (missing ? [missing] : []);
  const msg = ok
    ? `Gateway passed: ${gateway}.`
    : `Gateway blocked: ${gateway} • missing: ${miss.join(", ") || "unknown"}.`;

  await safeChrono({
    scope: "WORKFLOWS",
    message: msg,
    refType: "Deal",
    refId: dealId,
    dealId,
    contactId: byContactId || undefined,
    snapshot: { summary: "gateway", payload: { gateway, ok, missing: miss, context } },
  });

  return msg;
}

/**
 * Generate human “scripts” for an agent, based on the step + direction.
 * You can surface these as UI hints or email templates on the page.
 */
export function scriptsForStep(step: StepName, meta?: {
  sector?: string | null;
  service?: string | null;
  surveyMode?: "SALE" | "PROCUREMENT";
}) {
  const mode = meta?.surveyMode ?? "SALE";
  const sector = meta?.sector || "General";
  const service = meta?.service || "Service";

  switch (step) {
    case "lead":
      return [
        `Intro: “Hi, thanks for reaching out to corAe. Is ${service} for a ${sector} site?”`,
        "Collect: full name, email/phone, site address, preferred window, access notes.",
        "Ask: How did you hear about us?",
      ];

    case "btdo.intake":
      return mode === "SALE"
        ? [
            "Confirm scope: sector, service, work kind, geography.",
            "Survey: site access, hazards/PPE, timing windows.",
            "Docs prediction: WTN/POD/Contract/Insurance (adjust to sector).",
          ]
        : [
            "PROCUREMENT: request delivery/collection plan from supplier.",
            "Confirm: proposed delivery window, offload method, packaging/pallets.",
            "Docs prediction: Supplier Trade Licence, Insurance, MSDS (if chemicals), QA certs.",
          ];

    case "btdo.accept":
      return [
        "Confirm quote id and acceptance (email trail).",
        "Tick: price locked + corAe confirmed.",
        "Note any caveats or exclusions.",
      ];

    case "bdo.pricelock":
      return [
        "Issue/record Pricelock Chain: price, currency, valid window.",
        "Confirm who validated the price and until when.",
      ];

    case "bdo.contract":
      return [
        "Agreement-in-principle: capture URL or email ref.",
        "Record SOW summary, time window, optional total.",
      ];

    case "bdo.booking-sheet":
      return [
        "PO & SO numbers captured.",
        "Issue booking sheet link; confirm counterparty receipt and point-of-no-return.",
      ];

    case "bdo.documentation":
      return [
        "Collect commercial docs (contracts/PO/insurance).",
        "Collect operational docs (WTN, POD, delivery notes, MSDS).",
      ];

    case "bdo.activate":
      return [
        "Final check: mandatory docs complete.",
        "Flip to ACTIVE and notify finance & operations.",
      ];
  }
}

/**
 * Optional helper to be called by step handlers to:
 *  1) Log step saved.
 *  2) Audit the gateway (if mapped).
 *  3) Return the next step slug for the UI shell router.
 */
export async function afterStepSaved(opts: {
  step: StepName;
  dealId: string;
  refId?: string;
  contactId?: string | null;
  message?: string;
  snapshot?: Snapshot;
  gatewayCheck?: { ok: boolean; missing?: string[] | string | null };
}) {
  const { step, dealId, refId, contactId, message, snapshot, gatewayCheck } = opts;

  await logStepSaved({ step, dealId, refId, contactId, message, snapshot });

  const gw = STEP_GATE[step];
  if (gw && gatewayCheck) {
    await logGatewayAudit({
      dealId,
      gateway: gw,
      ok: gatewayCheck.ok,
      missing: gatewayCheck.missing || [],
      byContactId: contactId || undefined,
      context: { step },
    });
  }

  return nextStepSlug(step);
}

/* ───────────────────────── Utilities ───────────────────────── */

function nextStepSlug(step: StepName) {
  const order: StepName[] = [
    "lead",
    "btdo.intake",
    "btdo.accept",
    "bdo.pricelock",
    // "bdo.contract", // keep if you still use this gate
    "bdo.booking-sheet",
    "bdo.documentation",
    "bdo.activate",
  ];
  const i = order.indexOf(step);
  return i >= 0 && i < order.length - 1 ? order[i + 1] : null;
}

async function safeChrono(data: {
  scope: ChronoScope;
  message: string;
  refType?: string;
  refId?: string;
  dealId?: string;
  contactId?: string;
  snapshot?: Snapshot;
}) {
  try {
    await (prisma as any).chrono.create({ data });
  } catch {
    // ignore if Chrono not yet migrated
  }
}

/* ───────────────────────── Convenience (optional) ───────────────────────── */

/**
 * Convenience: call this at the end of each API step to log + compute next step.
 * Example:
 *    const msg = await commitStepAndReturnNext({ step:"btdo.accept", dealId, gatewayCheck:{ ok:true } })
 */
export async function commitStepAndReturnNext(opts: {
  step: StepName;
  dealId: string;
  refId?: string;
  contactId?: string | null;
  message?: string;
  snapshot?: Snapshot;
  gatewayCheck?: { ok: boolean; missing?: string[] | string | null };
}) {
  return afterStepSaved(opts);
}

/**
 * Provide a tiny DTO of scripts to the UI.
 * You can expose this via a GET route if needed.
 */
export function scriptsDTO(step: StepName, meta?: { sector?: string | null; service?: string | null; surveyMode?: "SALE" | "PROCUREMENT" }) {
  return {
    step,
    label: STEP_LABEL[step],
    scripts: scriptsForStep(step, meta),
  };
}