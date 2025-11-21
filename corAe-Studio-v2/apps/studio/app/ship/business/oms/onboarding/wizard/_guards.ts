/* Centralised gatekeeper for wizard step transitions.
   Keeps rules in one place and returns UX-friendly messages. */

export type DealStatus =
  | "BTDO"            // Intake captured, pre-acceptance
  | "BDO_READY"       // Quote accepted (ready to contract)
  | "CONTRACTED"      // Contract in place
  | "BDO_CONFIRMED"   // Booking sheet issued (point of no return)
  | "DOCUMENTED"      // All order docs compiled
  | "ACTIVE";         // Live / in service

type GateName = Exclude<DealStatus, "BTDO">; // everything we can move *to*

type AcceptCtx = {
  quoteId?: string | null;
  priceLocked?: boolean;
  corAeConfirmed?: boolean;
};

type ContractCtx = {
  contractUrlOrEmailRef?: string | null;
  agreementWindow?: string | null;
  agreementScope?: string | null;
  agreementTotal?: number | null;
};

type BookingCtx = {
  poNumber?: string | null;
  soNumber?: string | null;
  bookingSheetUrl?: string | null;
};

type DocsCtx = {
  docs?: Array<{ type: string; url: string }>;
};

type EmptyCtx = Record<string, never>;

type Ctx = AcceptCtx | ContractCtx | BookingCtx | DocsCtx | EmptyCtx;

export type GateResult = { ok: true; message: string } | { ok: false; missing: string };

/** Human-readable field map for tidy messages */
const labels: Record<string, string> = {
  quoteId: "Quote reference",
  priceLocked: "Price lock confirmation",
  corAeConfirmed: "corAe internal confirmation",
  contractUrlOrEmailRef: "Contract reference (URL or email message id)",
  agreementWindow: "Agreement window",
  agreementScope: "Agreement scope",
  agreementTotal: "Agreement total",
  poNumber: "PO number",
  soNumber: "SO number",
  bookingSheetUrl: "Booking sheet URL",
  docs: "Documentation items",
};

/**
 * verifyTransition
 * Ensures a transition from `current` to `target` meets required fields.
 */
export function verifyTransition(current: DealStatus, target: GateName, ctx: Ctx): GateResult {
  // Disallow backwards moves outright (except idempotent same-state)
  const order: DealStatus[] = ["BTDO", "BDO_READY", "CONTRACTED", "BDO_CONFIRMED", "DOCUMENTED", "ACTIVE"];
  const ci = order.indexOf(current);
  const ti = order.indexOf(target as DealStatus);
  if (ti < ci) {
    return { ok: false, missing: `Cannot move from ${current} back to ${target}.` };
  }

  // Idempotent: same state allowed
  if (ti === ci) {
    return { ok: true, message: `State remains ${target}.` };
  }

  // Enforce direct, linear progression
  if (ti !== ci + 1) {
    return { ok: false, missing: `Invalid jump: ${current} → ${target}. Follow the sequence.` };
  }

  // Field rules per transition
  switch (target) {
    case "BDO_READY": {
      const r = need(ctx, ["quoteId", "priceLocked", "corAeConfirmed"]);
      if (!r.ok) return r;
      return { ok: true, message: "Quote accepted. Deal is BDO_READY." };
    }
    case "CONTRACTED": {
      const r = need(ctx, ["contractUrlOrEmailRef", "agreementWindow", "agreementScope"]);
      if (!r.ok) return r;
      // agreementTotal optional; allow 0 for free trials etc.
      return { ok: true, message: "Contract recorded. Deal is CONTRACTED." };
    }
    case "BDO_CONFIRMED": {
      const r = need(ctx, ["poNumber", "soNumber", "bookingSheetUrl"]);
      if (!r.ok) return r;
      return { ok: true, message: "Booking sheet issued. Deal is BDO_CONFIRMED." };
    }
    case "DOCUMENTED": {
      const docs = (ctx as DocsCtx).docs || [];
      if (!Array.isArray(docs) || docs.length === 0) {
        return miss("docs");
      }
      const bad = docs.find((d) => !d?.type || !d?.url);
      if (bad) return { ok: false, missing: "Each document needs both type and url." };
      return { ok: true, message: "Documentation complete. Deal is DOCUMENTED." };
    }
    case "ACTIVE": {
      // No extra fields here; upstream mandatory-doc checks can block activation.
      return { ok: true, message: "Deal activated. Status is ACTIVE." };
    }
  }
}

/* ─────────────────────── helpers ─────────────────────── */

function need(ctx: Record<string, any>, keys: string[]): GateResult {
  const missing = keys.filter((k) => isEmpty(ctx[k]));
  if (missing.length) return miss(missing[0]);
  return { ok: true, message: "OK" };
}

function isEmpty(v: any) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim().length === 0;
  return false;
}

function miss(key: string): GateResult {
  const label = labels[key] ?? key;
  return { ok: false, missing: `Missing: ${label}.` };
}