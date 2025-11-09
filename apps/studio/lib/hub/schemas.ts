import { z } from "zod";

export const DealItem = z.object({
  sku: z.string(),
  name: z.string(),
  uom: z.string(),
  qty: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  // ✅ use .datetime() safely
  expiryDate: z.string().datetime().optional(),
});

export const CreateBTDO = z.object({
  mode: z.enum(["BUYER", "SELLER", "BROKER"]).default("BROKER"),
  vendorId: z.string(),
  clientId: z.string(),
  currency: z.string().length(3),
  creditTerms: z.string().optional(),
  vatPercent: z.number().min(0).max(100).optional(),
  discountPct: z.number().min(0).max(100).optional(),
  deliveryBranch: z.string().optional(),
  deliverySlotIso: z.string().datetime().optional(),
  logisticsNotes: z.string().optional(),
  items: z.array(DealItem).min(1),
  bigNine: z
    .object({
      signed_tcs: z.boolean().default(true),
      binding_quote: z.boolean().default(true),
      required_documents: z.boolean().default(true),
      contact_product_site_details: z.boolean().default(true),
      geographical_pricing: z.boolean().default(true),
      ops_docs_complete: z.boolean().default(true),
      booking_compliance: z.boolean().default(true),
      order_execution: z.boolean().default(false),
      reporting_and_remittance: z.boolean().default(false),
    })
    .partial(), // allows you to pass only some flags
});

export const ConfirmBDO = z.object({
  priceLock: z.literal("LOCK"),
  documents: z
    .array(
      z.object({
        kind: z.enum(["BDO", "QUOTE"]),
        url: z.string().url(),
      }),
    )
    .min(1),
});

export const IssuePO = z.object({
  poUrl: z.string().url(),
  deliverySlotIso: z.string().datetime(),
});

export const PostGRN = z.object({
  grnUrl: z.string().url(),
  stockUpdated: z.boolean(),
});

export const IssueInvoice = z.object({
  invoiceUrl: z.string().url(),
  paymentPlan: z
    .array(
      z.object({
        method: z.enum(["cash", "bank", "credit"]),
        amount: z.number().positive(),
        scheduledOn: z.string().datetime().optional(),
      }),
    )
    .min(1),
});

// Backwards-compatible placeholder used by some pages — provide a minimal
// runtime-friendly hubSchema object with stages and modes so pages that
// expect these properties can run during the build. Replace with the
// full merged hub schema later if needed.
export const hubSchema: any = {
  stages: ["ORDER", "BOOKING", "ACTIVE", "REPORTING", "INVOICING"],
  modes: ["BUYER", "SELLER", "BROKER"],
};

export default hubSchema;
