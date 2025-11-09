// packages/workfocus-core/wizard/first-trade.flow.ts
// Glue for the First-Trade wizard (aligned to first-trade.schema.ts)

export type { FirstTradeState, RoleKey } from "./first-trade.schema";

import type {
  FirstTradeIdentity,
  RolesShape,
  UploadsShape,
  DealsShape,
  Gap,
  BDO,
} from "./first-trade.schema";

/* ------------------------------------------------------------------ */
/* 1) Initial state                                                   */
/* ------------------------------------------------------------------ */

export function initialState(): import("./first-trade.schema").FirstTradeState {
  const identity: FirstTradeIdentity = {
    legalName: "",
    jurisdiction: "",
    activities: [],
    bank: { intent: "open" },
    vat: { intent: "register" },
  };

  const roles: RolesShape = {
    management: { ownerLed: true, aiAgent: "placeholder" },
    hr:         { ownerLed: true, aiAgent: "placeholder" },
    finance:    { ownerLed: true, aiAgent: "placeholder" },
    operations: { ownerLed: true, aiAgent: "placeholder" },
  };

  const uploads: UploadsShape = {
    licences: [],
    lease: [],
    vatDocs: [],
    vendorsCsv: [],
    customersCsv: [],
    staffCsv: [],
  };

  const deals: DealsShape = {
    firstDeal: {
      party: "customer",
      name: "",
      pricing: "fixed", // or "A+X"
      x: undefined,
      skuSet: [],
      mode: "visit",    // or "survey"
    },
    importedDeals: [],
  };

  const gaps: Gap[] = [];
  const bdos: BDO[] = [];

  return {
    mode: "new",
    identity,
    roles,
    uploads,
    deals,
    gaps,
    bdos,
  };
}

/* ------------------------------------------------------------------ */
/* 2) Draft persistence (localStorage)                                 */
/* ------------------------------------------------------------------ */

const LS_KEY = "corAe.firstTrade.v2.draft";

export function persistDraft(state: import("./first-trade.schema").FirstTradeState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    // ignore (SSR or locked storage)
  }
}

export function loadDraft():
  | import("./first-trade.schema").FirstTradeState
  | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as import("./first-trade.schema").FirstTradeState) : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 3) Submit — map Wizard state → lightweight OBARI “BDO” payload      */
/*    (stub endpoint you can wire to your backend)                     */
/* ------------------------------------------------------------------ */

// Minimal shapes the backend expects
type Minor = number;
type Direction = "inbound" | "outbound";

type BdoLine = {
  sku: string;
  title: string;
  qty: number;
  unit_price: Minor; // minor units
  uom?: string;
  sector_hint?: string;
};

type BdoDraft = {
  bdo_id: string;
  direction: Direction;
  counterparty: { id: string; name: string };
  our_party: { id: string; name: string };
  schedule:
    | { kind: "ad_hoc" }
    | { kind: "scheduled"; rule: string; day?: string; window?: string };
  transport: { in_quote: boolean; mode?: "vendor" | "third_party" | "client" };
  lines: BdoLine[];
  geography?: { country: string; region?: string; postcode?: string };
  references?: { client_po?: string; quote_id?: string; product_ids?: string[] };
  notes?: string;
};

const rnd = (p = "BDO") => `${p}_${Math.random().toString(36).slice(2, 10)}`;
const toMinor = (n: number | undefined) =>
  Math.round(Number.isFinite(n as number) ? (n as number) * 100 : 0);

export async function submitFirstTrade(
  state: import("./first-trade.schema").FirstTradeState
) {
  // Since our current schema is “company bootstrap”, we’ll emit a
  // single safe test line and sensible defaults. You can enrich this
  // when you add product picking to the wizard.
  const testLine: BdoLine = {
    sku: "Seed-0001",
    title: "Seed Item",
    qty: 1,
    unit_price: toMinor(1), // £1.00
    uom: "EA",
    sector_hint: "other",
  };

  // “new” companies default to outbound (we sell to first customer)
  const direction: Direction =
    state.deals.firstDeal?.party === "vendor" ? "inbound" : "outbound";

  const draft: BdoDraft = {
    bdo_id: rnd(),
    direction,
    counterparty: {
      id:
        state.deals.firstDeal?.party === "vendor"
          ? "Vendor0001"
          : "Customer0001",
      name:
        state.deals.firstDeal?.name?.trim() ||
        (state.deals.firstDeal?.party === "vendor"
          ? "Vendor 0001"
          : "Customer 0001"),
    },
    our_party: {
      id: "OPS",
      name:
        state.identity.legalName?.trim() ||
        "Operations",
    },
    // simple default schedule; wizard page can refine later
    schedule: { kind: "scheduled", rule: "EVERY_4_WEEKS", day: "W2" },
    transport: { in_quote: false, mode: "third_party" },
    lines: [testLine],
    geography: { country: "UK", region: "GEN", postcode: "GEN1" },
    references: {},
    notes: "",
  };

  // POST to your (stub or real) endpoint
  const res = await fetch("/api/business/oms/obari/order/staging", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to stage order");
  }

  return data.snapshot as {
    snapshot_id: string;
    order_numbers: { po_no?: string; so_no?: string };
    direction: Direction;
  };
}