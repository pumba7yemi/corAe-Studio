import { z } from "zod";

/* ───────────────────────────
   Role keys / roles
─────────────────────────── */

export const ROLE_KEYS = ["management", "hr", "finance", "operations"] as const;
export const RoleKeyZ = z.enum(ROLE_KEYS);
export type RoleKey = z.infer<typeof RoleKeyZ>;

export const RoleAssignmentZ = z.object({
  ownerLed: z.boolean(),
  aiAgent: z.enum(["placeholder", "assigned"]),
  overseerId: z.string().optional(),
});
export type RoleAssignment = z.infer<typeof RoleAssignmentZ>;

export const RolesShapeZ = z.object({
  management: RoleAssignmentZ,
  hr:         RoleAssignmentZ,
  finance:    RoleAssignmentZ,
  operations: RoleAssignmentZ,
});
export type RolesShape = z.infer<typeof RolesShapeZ>;

/* ───────────────────────────
   Identity
─────────────────────────── */

export const FirstTradeIdentityZ = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  activities: z.array(z.string()).default([]),
  bank: z.object({
    intent: z.enum(["open", "connected"]),
    accountId: z.string().optional(),
  }).optional(),
  vat: z.object({
    intent: z.enum(["register", "connected"]),
    trn: z.string().optional(),
  }).optional(),
});
export type FirstTradeIdentity = z.infer<typeof FirstTradeIdentityZ>;

/* ───────────────────────────
   Deals
─────────────────────────── */

export const FirstDealZ = z.object({
  party: z.enum(["vendor", "customer"]),
  name: z.string().min(1, "Party name is required"),
  pricing: z.enum(["A+X", "fixed"]),
  x: z.number().optional(),          // required only if pricing == "A+X"? gate below if you prefer
  skuSet: z.array(z.string()).default([]),
  mode: z.enum(["visit", "survey"]),
}).superRefine((val, ctx) => {
  if (val.pricing === "A+X" && (val.x === undefined || Number.isNaN(val.x))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "X is required for A+X pricing", path: ["x"] });
  }
});

export type FirstDeal = z.infer<typeof FirstDealZ>;

export const DealsShapeZ = z.object({
  firstDeal: FirstDealZ.optional(),
  importedDeals: z.array(FirstDealZ).optional(),
});
export type DealsShape = z.infer<typeof DealsShapeZ>;

/* ───────────────────────────
   Uploads (established)
─────────────────────────── */

export const UploadsShapeZ = z.object({
  licences: z.array(z.string()).optional(),
  lease: z.array(z.string()).optional(),
  vatDocs: z.array(z.string()).optional(),
  vendorsCsv: z.array(z.string()).optional(),
  customersCsv: z.array(z.string()).optional(),
  staffCsv: z.array(z.string()).optional(),
});
export type UploadsShape = z.infer<typeof UploadsShapeZ>;

/* ───────────────────────────
   Gaps & BDOs
─────────────────────────── */

export const GapZ = z.object({
  id: z.string(),
  desc: z.string(),
  resolved: z.boolean().default(false),
});
export type Gap = z.infer<typeof GapZ>;

export const BDOZ = z.object({
  id: z.string(),
  type: z.string(),
  ref: z.string().optional(),
  createdAt: z.string(), // ISO string
});
export type BDO = z.infer<typeof BDOZ>;

/* ───────────────────────────
   Root state
─────────────────────────── */

export const ModeZ = z.enum(["new", "established"]);

export const FirstTradeStateZ = z.object({
  mode: ModeZ,
  identity: FirstTradeIdentityZ,
  roles: RolesShapeZ,
  uploads: UploadsShapeZ.optional().default({}),
  deals: DealsShapeZ.default({}),
  gaps: z.array(GapZ).default([]),
  bdos: z.array(BDOZ).default([]),
});
export type FirstTradeState = z.infer<typeof FirstTradeStateZ>;

/* ───────────────────────────
   Helpers for step validation
─────────────────────────── */

export const validateIdentity = (s: FirstTradeState) =>
  FirstTradeIdentityZ.safeParse(s.identity).success;

export const validateDeals = (s: FirstTradeState) =>
  s.mode === "new"
    ? !!s.deals.firstDeal && FirstDealZ.safeParse(s.deals.firstDeal).success
    : true;

export const validateRoles = (s: FirstTradeState) =>
  RolesShapeZ.safeParse(s.roles).success;