// ────────────────────────────────────────────────────────────────
// corAe Constitutional Law — OBARI Survey→Quote Chain
// Purpose: Define the immutable principle that all operational
// and financial data within OBARI originates from the Survey→Quote
// process.  The Quote is the single lawful source of truth.
// ────────────────────────────────────────────────────────────────

/**
 * Canonical Principle
 * A. Every Order, Product, or Invoice must descend from an accepted Quote.
 * B. Every Quote must descend from a Survey.
 * C. Therefore: Survey → Quote → Product → Order → Report → Invoice.
 */

export const OBARI_SURVEY_QUOTE_LAW = {
  canon: "survey_quote_chain",
  definition:
    "All commercial and operational data shall originate from a Survey " +
    "which, when transformed into a Quote, populates the schemas for " +
    "pricing, description, department, geography, transport, schedule, " +
    "and compliance requirements.",

  obligations: {
    survey: [
      "Every Survey must be time-stamped, linked to a Client/Site, and " +
        "contain the factual basis for cost, logistics, and compliance fields.",
      "Surveys are evidentiary documents and may not be deleted once used " +
        "to generate a Quote (only superseded).",
    ],

    quote: [
      "The Quote object is the lawful commercial instrument from which " +
        "Product, Order, and Invoice data are derived.",
      "A Quote may be amended until 'accepted'.  Once accepted, it becomes " +
        "immutable and forms the price-lock for the corresponding BDO.",
      "All derived schemas (Product, Order, Report, Invoice) must read " +
        "fields from the accepted Quote — never the Survey directly.",
    ],

    pricing: [
      "All pricing must declare its derivation: cost_plus | fixed | tiered.",
      "Effective cost = base_cost + transport_cost + extras.",
      "Sell price = apply(pricing.model, markup).",
      "Markup/margin logic must be transparent and stored within Quote.lines[].pricing.",
    ],

    lineage: [
      "Each entity shall carry a 'source' property referencing its parent " +
        "in the chain (e.g., Order.source.quote_id).",
      "The chain must remain forward-only (no retroactive edits after acceptance).",
      "Where a revision is necessary, a new Survey/Quote pair shall be issued " +
        "and linked by revision_of.",
    ],

    compliance: [
      "Any document (RAMS, WTN, etc.) required by Quote.lines[].compliance " +
        "must be present before activation (Active Stage).",
      "Orders missing mandatory compliance artifacts may not progress to Active.",
    ],
  },

  rights: {
    system: [
      "corAe modules may auto-generate Product, Order, and Invoice data " +
        "from accepted Quotes without additional human input.",
    ],
    owner: [
      "The Owner retains authority to override pricing only via issuance of " +
        "a new Quote revision, preserving full audit lineage.",
    ],
  },

  enforcement: {
    violation_effect:
      "Any Order or Invoice lacking a valid Quote lineage shall be marked INVALID " +
      "under corAe Compliance Law and excluded from financial reporting until corrected.",
    audit:
      "System audits shall trace each financial record to its originating Survey and Quote.",
  },
};

export default OBARI_SURVEY_QUOTE_LAW;