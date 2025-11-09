export type OrderPattern = "single" | "dual";

export interface SectorEntry {
  key: string;
  parent:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "quinary";
  orderPattern: OrderPattern;
  templates: string[];        // template keys like "retail.v1"
  features?: string[];        // optional tags for UI/filtering
  linkedSector?: string;      // for paired flows (e.g., waste ↔ transport)
}

export interface BDOBlueprintLine {
  sku: string;
  desc: string;
  uom: string;
  plannedQty: number;
}

export interface BDOBlueprint {
  blueprintKey: string;       // e.g. "retail.v1"
  name: string;
  channel: string;            // sector key
  cadenceDays?: number;       // default 28
  orderPattern: OrderPattern;
  defaultTerms?: string;
  defaultMarginPct?: number;
  linkedBlueprint?: string;   // for dual/paired orders
  workflow?: { stages: string[] };
  documentation?: { required: string[]; generateAuto?: boolean; retainYears?: number };
  vendorPolicy?: { priceLock: boolean; renewalCycleDays?: number };
  lines: BDOBlueprintLine[];
}

