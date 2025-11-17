// corAe Gate Controller — single source of truth for allowed transitions.
// ONE FILE. Pure logic (no DB). Import this in your API route(s).

export type DealStatus =
  | "BTDO"            // intake → quote
  | "BDO_READY"       // quote accepted (Pricelock + corAe Confirmed)
  | "CONTRACTED"      // agreement-in-principle (contract/email window+scope)
  | "BDO_CONFIRMED"   // booking sheet issued (PO + SO) = point of no return
  | "DOCUMENTED"      // docs verified
  | "ACTIVE"          // execution
  | "REPORTED"
  | "INVOICED"
  | "CLOSED";

type Checks = {
  // Quote acceptance (BTDO → BDO_READY)
  quoteId?: string;
  priceLocked?: boolean;     // Pricelock Chain™
  corAeConfirmed?: boolean;  // corAe Confirmed™

  // Contract gate (BDO_READY → CONTRACTED)
  contractUrlOrEmailRef?: string; // signed PDF link OR email/thread id
  agreementWindow?: string;       // e.g., "Thu AM" or "2025-11-02 09:00–12:00"
  agreementScope?: string;        // short SOW summary
  agreementTotal?: number;        // optional numeric confirmation

  // Booking sheet gate (CONTRACTED → BDO_CONFIRMED)
  poNumber?: string;
  soNumber?: string;
  bookingSheetUrl?: string;

  // Documentation gate (BDO_CONFIRMED → DOCUMENTED)
  docs?: Array<{ type: string; url: string }>;
};

type Gate = {
  from: DealStatus;
  to: DealStatus;
  pre: (ctx: Checks) => string[];   // missing requirements
  chrono: (ctx: Checks) => string;  // canonical log message
};

export const GATES: Gate[] = [
  // 1) Quote acceptance
  {
    from: "BTDO",
    to: "BDO_READY",
    pre: (c) => {
      const miss: string[] = [];
      if (!c.quoteId) miss.push("quoteId");
      if (!c.priceLocked) miss.push("priceLocked (Pricelock Chain™)");
      if (!c.corAeConfirmed) miss.push("corAeConfirmed (corAe Confirmed™)");
      return miss;
    },
    chrono: () => "Quote accepted → BDO Ready (Pricelock + corAe Confirmed).",
  },

  // 2) Agreement-in-principle (contract/email)
  {
    from: "BDO_READY",
    to: "CONTRACTED",
    pre: (c) => {
      const miss: string[] = [];
      if (!c.contractUrlOrEmailRef) miss.push("contractUrlOrEmailRef");
      if (!c.agreementWindow) miss.push("agreementWindow");
      if (!c.agreementScope) miss.push("agreementScope");
      return miss;
    },
    chrono: (c) =>
      `Agreement in principle recorded (window: ${c.agreementWindow}). Contract ref saved.`,
  },

  // 3) Booking sheet = point of no return
  {
    from: "CONTRACTED",
    to: "BDO_CONFIRMED",
    pre: (c) => {
      const miss: string[] = [];
      if (!c.poNumber) miss.push("poNumber");
      if (!c.soNumber) miss.push("soNumber");
      if (!c.bookingSheetUrl) miss.push("bookingSheetUrl");
      return miss;
    },
    chrono: (c) =>
      `Booking sheet issued — PO ${c.poNumber}, SO ${c.soNumber}. Point of no return.`,
  },

  // 4) Documentation verified
  {
    from: "BDO_CONFIRMED",
    to: "DOCUMENTED",
    pre: (c) => (!c.docs?.length ? ["documents[]"] : []),
    chrono: (c) => `Documentation verified (${c.docs?.length ?? 0} files).`,
  },

  // 5) Activate work
  {
    from: "DOCUMENTED",
    to: "ACTIVE",
    pre: () => [],
    chrono: () => "Deal moved to ACTIVE.",
  },
];

// Engine — verify & produce results (no side effects)
export function verifyTransition(
  current: DealStatus,
  target: DealStatus,
  checks: Checks
): { ok: true; message: string } | { ok: false; missing: string[] } {
  const gate = GATES.find((g) => g.from === current && g.to === target);
  if (!gate) return { ok: false, missing: [`Transition not allowed: ${current} → ${target}`] };
  const missing = gate.pre(checks);
  if (missing.length) return { ok: false, missing };
  return { ok: true, message: gate.chrono(checks) };
}