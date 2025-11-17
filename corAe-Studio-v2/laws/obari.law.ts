// /laws/obari.law.ts
// corAe Constitutional Law — OBARI
// Purpose: Define the non-negotiable principles of the OBARI system,
// including the forward-only "=" baton, stages, transitions, and acceptance gates.
// Pure TypeScript constants — no imports or aliases.

/** Canonical OBARI stage names (constitution) */
type StageCanonical =
  | "order"       // Commercial commitment (contract/PO) — includes BTDO/BDO sub-states
  | "booking"     // Resources/slot confirmed; docs seeded
  | "active"      // Execution/delivery in progress
  | "reporting"   // Variance/returns/weights resolved; acceptance
  | "invoicing"   // Finance issue/verification
  | "finalized";  // Fully settled & archived

/** Accepted legacy/alias stage labels (domain vernacular) */
type StageAlias =
  | "BTDO"        // Brokering The Deal Order (commercial intent)
  | "BDO"         // Brokered Deal Order (commercial commitment)
  | "BOOKING"
  | "ACTIVE"
  | "REPORT"
  | "INVOICE"
  | "FINALIZED";

/** Union that validators may encounter in data */
type Stage = StageCanonical | StageAlias;

type EqualsVariant = "BASE" | "REPORT_ADJUSTED" | "FINAL";

type Transition = {
  from: Stage;
  to: Stage;
  requires: string[];        // Acceptance gates (must be true)
  produces?: string[];       // Artifacts emitted on transition
  notes?: string[];
};

type BatonLaw = {
  statement: string;
  forwardOnly: boolean;
  immutable: boolean;
  chain: Array<{
    name: string;
    stage: Stage;            // May be canonical or alias; see normalization
    variant: EqualsVariant;
    description: string;
  }>;
  integrityChecks: string[]; // What auditors/validators must verify
};

type Gate = {
  name: string;
  stage: Stage;
  must: string[];            // Human/AI verifications that unlock the stage
  evidence: string[];        // Files/records that prove the gate
};

type PricelockPolicy = {
  statement: string;
  immutableAfter: Stage;     // After which stage price cannot change
};

type InvoiceHandoffPolicy = {
  fromStage: Stage;
  consumes: EqualsVariant;
  must: string[];
};

type NormalizationRule = {
  alias: StageAlias;
  canonical: StageCanonical;
  description: string;
};

type ObariLaw = {
  name: "OBARI Constitutional Law";
  statement: string;

  /** Canonical stage set (for design & schemas) */
  canonicalStages: StageCanonical[];

  /** Accepted aliases and how they normalize */
  normalization: NormalizationRule[];

  /** Transitions are defined in the language users actually employ (aliases allowed) */
  transitions: Transition[];

  /** Stage gates (proofs) */
  gates: Gate[];

  /** The immutable forward-only '=' baton rules */
  equalsBaton: BatonLaw;

  /** Finance policies (price lock & invoice handoff) */
  finance: {
    pricelockChain: PricelockPolicy;
    invoiceHandoff: InvoiceHandoffPolicy;
  };

  /** Auditing & storage */
  audit: {
    requiredLogs: string[];  // Minimal audit events required
    fileStores: string[];    // Canonical write-once stores
  };

  /** Validator contracts (natural-language; implemented elsewhere) */
  validators: {
    stageNormalizer: string;     // How to map any Stage → StageCanonical
    linearityChecker: string;    // No skips/regressions without exception record
    batonIntegrity: string;      // Hash linkage across BASE → REPORT_ADJUSTED → FINAL
    gateEvidenceChecker: string; // Required evidence must exist before transition
  };

  notes?: string[];
};

export const OBARI_Law: ObariLaw = {
  name: "OBARI Constitutional Law",
  statement:
    "OBARI governs the lifecycle of a deal from intent to income. Movement between stages is gated by proofs, and each forward step is captured as an immutable '=' snapshot carried like a baton. Canonical stages are order → booking → active → reporting → invoicing → finalized. Legacy labels (BTDO/BDO/REPORT/INVOICE/FINALIZED) normalize to those canonicals.",

  canonicalStages: ["order", "booking", "active", "reporting", "invoicing", "finalized"],

  normalization: [
    { alias: "BTDO",      canonical: "order",      description: "Commercial intent (pre-commit) inside ORDER" },
    { alias: "BDO",       canonical: "order",      description: "Commercial commitment (price-locked) inside ORDER" },
    { alias: "BOOKING",   canonical: "booking",    description: "Resources/slot confirmed; docs seeded" },
    { alias: "ACTIVE",    canonical: "active",     description: "Execution/delivery in progress" },
    { alias: "REPORT",    canonical: "reporting",  description: "Variance/acceptance; sums agreed" },
    { alias: "INVOICE",   canonical: "invoicing",  description: "Invoice issue & verification" },
    { alias: "FINALIZED", canonical: "finalized",  description: "Closed & archived" },
  ],

  // Transitions are expressed with the vernacular the business uses (aliases) while remaining canonical via normalization.
  transitions: [
    {
      from: "BTDO",
      to: "BDO",
      requires: [
        "Commercial terms drafted (parties, item/service, schedule cadence)",
        "Required documents matrix seeded (POD/WTN/INV/OTHER)"
      ],
      produces: ["Proposal record"],
      notes: ["BTDO defines what may exist in BDO (both normalize to ORDER)"]
    },
    {
      from: "BDO",
      to: "BOOKING",
      requires: [
        "Pricelock acknowledged (priceLock = LOCK)",
        "Deal.status = confirmed",
        "BASE '=' snapshot written (.data/equals/*)"
      ],
      produces: ["Booking eligibility", "PO/Confirmation PDF (optional)"]
    },
    {
      from: "BOOKING",
      to: "ACTIVE",
      requires: [
        "Booking created (slot/date/location assigned)",
        "DocumentationPhase seeded (POD, Invoice, WTN, etc.)"
      ],
      produces: ["BookingForm.pdf", "ReportForm.pdf"]
    },
    {
      from: "ACTIVE",
      to: "REPORT",
      requires: [
        "Operational work/delivery recorded",
        "Docs received or pending (POD/Receipt/Invoice/Photo)"
      ],
      produces: ["Operational notes/variances"]
    },
    {
      from: "REPORT",
      to: "INVOICE",
      requires: [
        "REPORT_ADJUSTED '=' exists referencing BASE hash",
        "Report approved (human/AI) with multiplier/variance resolved",
        "FINAL '=' snapshot written (.data/equals-final/*)"
      ],
      produces: ["Invoice-ready totals"],
      notes: ["Approval confirms the truth; Final seals it"]
    },
    {
      from: "INVOICE",
      to: "FINALIZED",
      requires: [
        "Invoice issued and verified (Finance)",
        "Bill-to-Bill entries posted",
        "FileLogic verification complete"
      ],
      produces: ["Closure audit"]
    }
  ],

  gates: [
    {
      name: "Confirm BDO",
      stage: "BDO",
      must: [
        "Pricelock = LOCK",
        "Deal.status = confirmed",
        "BASE '=' payload canonicalized & hashed"
      ],
      evidence: [".data/equals/{dealId}-{hash}.json"]
    },
    {
      name: "Report Adjust",
      stage: "REPORT",
      must: [
        "Adjusted lines reflect multiplier/variance",
        "Totals recomputed (subtotal, taxTotal, total)",
        "Adjusted.baseHash == Base.hash"
      ],
      evidence: [".data/equals-adjusted/{dealId}-{hash}-rpt.json"]
    },
    {
      name: "Report Finalize",
      stage: "REPORT",
      must: [
        "FINAL '=' created from latest REPORT_ADJUSTED",
        "Final.adjustedHash == Adjusted.hash"
      ],
      evidence: [".data/equals-final/{dealId}-{hash}-final.json"]
    }
  ],

  equalsBaton: {
    statement:
      "The '=' snapshot is the baton that advances the deal; it is immutable and forward-only.",
    forwardOnly: true,
    immutable: true,
    chain: [
      {
        name: "Base",
        stage: "BDO",               // normalizes to 'order'
        variant: "BASE",
        description: "Confirmed commercial terms sealed at BDO (price-locked)."
      },
      {
        name: "Report Adjusted",
        stage: "REPORT",            // normalizes to 'reporting'
        variant: "REPORT_ADJUSTED",
        description: "Operational reality applied (multiplier/returns/weights)."
      },
      {
        name: "Final",
        stage: "REPORT",            // normalizes to 'reporting'
        variant: "FINAL",
        description: "Sealed totals for invoicing; no further mutation allowed."
      }
    ],
    integrityChecks: [
      "Adjusted.baseHash === Base.hash",
      "Final.adjustedHash === Adjusted.hash",
      "Hash(fileContent) matches filename fragment"
    ]
  },

  finance: {
    pricelockChain: {
      statement:
        "After BDO confirmation, commercial price is locked; changes require a pre-approved exception path.",
      immutableAfter: "BDO" // normalizes to 'order'
    },
    invoiceHandoff: {
      fromStage: "REPORT",          // normalizes to 'reporting'
      consumes: "FINAL",
      must: [
        "FINAL '=' present",
        "Totals parse to numeric (>= 0)",
        "Currency set and supported by Finance"
      ]
    }
  },

  audit: {
    requiredLogs: [
      "DEAL_CONFIRM (BDO)",
      "BOOKING_CREATE",
      "REPORT_ADJUST",
      "REPORT_FINALIZE",
      "INVOICE_CREATE",
      "FINALIZE_CLOSE"
    ],
    fileStores: [
      ".data/equals",
      ".data/equals-adjusted",
      ".data/equals-final",
      "public/uploads/obari/booking/*"
    ]
  },

  validators: {
    stageNormalizer:
      "Normalize any Stage to canonical: {BTDO→order, BDO→order, REPORT→reporting, INVOICE→invoicing, FINALIZED→finalized}. BOOKING/ACTIVE already map 1:1.",
    linearityChecker:
      "Enforce linear progression order→booking→active→reporting→invoicing→finalized. Aliases must first normalize; no jumps/regressions without a formal exception record.",
    batonIntegrity:
      "Verify BASE → REPORT_ADJUSTED → FINAL hashes chain correctly and are immutable and forward-only.",
    gateEvidenceChecker:
      "Before transition, assert required evidence files exist and pass hash/structure validation."
  },

  notes: [
    "BTDO/BDO are sub-states of the canonical 'order' stage; both are accepted inputs and normalize to ORDER.",
    "REPORT and INVOICE labels remain accepted for teams; they normalize to reporting/invoicing for schemas.",
    "This reconciliation preserves team language while enforcing a single canonical backbone for data models and automation."
  ]
};

export default OBARI_Law;