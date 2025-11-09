// ────────────────────────────────────────────────────────────────
// corAe Test — OBARI Survey→Quote Chain (Smoke Test)
// Purpose: verify lawful lineage Survey → Quote → Product → Order
// ────────────────────────────────────────────────────────────────

import { test } from "node:test";
import {
  populateQuoteFromSurvey,
  acceptQuote,
  deriveProductsFromQuote,
  createOrdersFromQuote,
  gateCompliance,
  transportFlag,
  type SurveyCore,
  type QuoteLineSeed,
  type ComplianceBundle
} from "../laws/obari-surveyquote.annex";

// Use Jest's global test/expect provided by the test runner; no explicit import needed
const pence = (gbp: number) => Math.round(gbp * 100);

test("Survey → Quote → Product → Order happy path", () => {
  const survey: SurveyCore = {
    survey_id: "S-1001",
    client_id: "CL-AMB",
    site_id: "SITE-THET",
    product_family: "pallets",
    cdjrs: "collection",
    description_raw: "White pallet weekly collection",
    requirements: ["clear yard by Friday", "WTN required"],
    usage_pattern: { freq: "scheduled", cadence: "WEEKLY:FRI" },
    geography: { country: "UK", region: "East", postcode: "IP24" },
    schedule_pref: { days: ["FRI"], window: "08:00-12:00" },
    transport: { in_quote: false, own_transport: false },
    department_hint: "4010-Sales-Pallets",
    compliance_flags: ["WTN"]
  };

  const lines: QuoteLineSeed[] = [
    {
      title: "White pallet pickup (per load)",
      uom: "load",
      quantity: 1,
      pricing: {
        model: { kind: "cost_plus", markup_pct: 0.12 },
        costs: { base_cost: pence(180), transport_cost: pence(0), extras: pence(0) }
      },
      compliance: ["WTN"]
    }
  ];

  const draft = populateQuoteFromSurvey(survey, lines);
  const accepted = acceptQuote(draft);
  const products = deriveProductsFromQuote(accepted);
  const orders = createOrdersFromQuote(accepted, products);

  expect(accepted.status).toBe("accepted");
  expect(products[0].department).toBe("4010-Sales-Pallets");
  expect(orders[0].schedule !== undefined).toBe(true);
  expect(orders[0].schedule!.kind).toBe("scheduled");

  const bundle: ComplianceBundle = {
    required: ["WTN"],
    provided: [{ kind: "WTN", uri: "s3://docs/wtn-template.pdf" }]
  };
  expect(gateCompliance(bundle).ok).toBe(true);
  expect(transportFlag(accepted)).toBe("CDC");
});


// Jest's expect will be used
