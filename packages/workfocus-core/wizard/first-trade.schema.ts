// packages/workfocus-core/wizard/first-trade.schema.ts

/* ───────────────────────────
   Role keys
─────────────────────────── */

export const ROLE_KEYS = ["management", "hr", "finance", "operations"] as const;
export type RoleKey = typeof ROLE_KEYS[number];

/* ───────────────────────────
   Roles & Agents
─────────────────────────── */

export interface RoleAssignment {
  ownerLed: boolean;                 // true = owner currently leads
  aiAgent: "placeholder" | "assigned"; // corAe AI agent assignment
  overseerId?: string;               // optional human overseer ID later
}

export type RolesShape = Record<RoleKey, RoleAssignment>;

/* ───────────────────────────
   Identity / company setup
─────────────────────────── */

export interface FirstTradeIdentity {
  legalName: string;
  jurisdiction: string;
  activities: string[];
  bank?: {
    intent: "open" | "connected";
    accountId?: string;
  };
  vat?: {
    intent: "register" | "connected";
    trn?: string;
  };
}

/* ───────────────────────────
   Deals (first deal or imports)
─────────────────────────── */

export interface FirstDeal {
  party: "vendor" | "customer";
  name: string;
  pricing: "A+X" | "fixed";
  x?: number;          // used if A+X pricing
  skuSet: string[];    // products/services
  mode: "visit" | "survey";
}

export interface DealsShape {
  firstDeal?: FirstDeal;
  importedDeals?: FirstDeal[]; // for established imports
}

/* ───────────────────────────
   Uploads (for established)
─────────────────────────── */

export interface UploadsShape {
  licences?: string[];    // URLs or IDs after upload
  lease?: string[];
  vatDocs?: string[];
  vendorsCsv?: string[];
  customersCsv?: string[];
  staffCsv?: string[];
}

/* ───────────────────────────
   Gaps & BDOs
─────────────────────────── */

export interface Gap {
  id: string;
  desc: string;
  resolved: boolean;
}

export interface BDO {
  id: string;
  type: string;  // e.g. "vendorOrder", "customerOrder"
  ref?: string;
  createdAt: string;
}

/* ───────────────────────────
   First Trade State
─────────────────────────── */

export interface FirstTradeState {
  mode: "new" | "established";
  identity: FirstTradeIdentity;
  roles: RolesShape;
  uploads: UploadsShape;
  deals: DealsShape;
  gaps: Gap[];
  bdos: BDO[];
}

export const MODULE = "WorkFocus";