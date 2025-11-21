#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT = join(__dirname, ".."); // repo root
const PKG = join(ROOT, "packages", "bdo-core");

// ---------- helpers ----------
function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}
function write(p, data) {
  ensureDir(dirname(p));
  if (!existsSync(p)) writeFileSync(p, data.trimStart() + "\n");
}

// ---------- directory plan ----------
const sectorPaths = [
  ["1-primary", "agriculture"],
  ["1-primary", "fishing"],
  ["1-primary", "forestry"],
  ["1-primary", "mining"],
  ["1-primary", "oil-gas"],
  ["2-secondary", "manufacturing"],
  ["2-secondary", "construction"],
  ["2-secondary", "energy-utilities"],
  ["3-tertiary", "retail"],
  ["3-tertiary", "wholesale"],
  ["3-tertiary", "finance"],
  ["3-tertiary", "hospitality"],
  ["3-tertiary", "transport"],
  ["3-tertiary", "media"],
  ["3-tertiary", "personal-services"],
  ["4-quaternary", "information-technology"],
  ["4-quaternary", "telecommunications"],
  ["4-quaternary", "research-development"],
  ["4-quaternary", "professional-services"],
  ["5-quinary", "healthcare"],
  ["5-quinary", "education"],
  ["5-quinary", "government"],
  ["5-quinary", "non-profit"],
];

const templateFiles = [
  ["retail", "bdo.template.v1.json", retailTemplate()],
  ["restaurant", "bdo.template.v1.json", restaurantTemplate()],
  ["hotel", "bdo.template.v1.json", hotelTemplate()],
  ["waste", "bdo.template.v1.json", wasteTemplate()],
  ["transport", "bdo.template.v1.json", transportTemplate()],
];

// ---------- create directories ----------
ensureDir(PKG);
ensureDir(join(PKG, "sectors"));
for (const [tier, leaf] of sectorPaths) {
  ensureDir(join(PKG, "sectors", tier, leaf));
}

ensureDir(join(PKG, "templates"));
for (const [folder] of templateFiles) {
  ensureDir(join(PKG, "templates", folder));
}

ensureDir(join(PKG, "src"));

// ---------- write templates ----------
for (const [folder, filename, content] of templateFiles) {
  write(join(PKG, "templates", folder, filename), content);
}

// ---------- write TS sources ----------
write(join(PKG, "src", "sector.types.ts"), sectorTypesTs());
write(join(PKG, "src", "sectors.registry.ts"), sectorsRegistryTs());
write(join(PKG, "src", "sectors.loader.ts"), sectorsLoaderTs());

console.log("✅ bdo-core sector structure & starter files created");

// ---------- file contents ----------
function sectorTypesTs() {
  return `
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
`;
}

function sectorsRegistryTs() {
  return `
import type { SectorEntry } from "./sector.types";

export const SectorRegistry: SectorEntry[] = [
  // 1. Primary
  { key: "agriculture",        parent: "primary",   orderPattern: "single", templates: ["agriculture.v1"],        features: ["inventory","scheduling","transport"] },
  { key: "fishing",            parent: "primary",   orderPattern: "single", templates: ["fishing.v1"],            features: ["catch-log","cold-chain","compliance"] },
  { key: "forestry",           parent: "primary",   orderPattern: "single", templates: ["forestry.v1"],           features: ["harvest","transport","sustainability"] },
  { key: "mining",             parent: "primary",   orderPattern: "dual",   templates: ["mining.v1"],             features: ["logistics","compliance","equipment"] },
  { key: "oil-gas",            parent: "primary",   orderPattern: "dual",   templates: ["oil-gas.v1"],            features: ["contracts","safety","logistics"] },

  // 2. Secondary
  { key: "manufacturing",      parent: "secondary", orderPattern: "single", templates: ["manufacturing.v1"],      features: ["inventory","production","reporting"] },
  { key: "construction",       parent: "secondary", orderPattern: "dual",   templates: ["construction.v1"],       features: ["project","procurement","compliance"] },
  { key: "energy-utilities",   parent: "secondary", orderPattern: "dual",   templates: ["energy-utilities.v1"],  features: ["metering","contracts","maintenance"] },

  // 3. Tertiary
  { key: "retail",             parent: "tertiary",  orderPattern: "single", templates: ["retail.v1"],             features: ["pos","inventory","vendor-cycle"] },
  { key: "wholesale",          parent: "tertiary",  orderPattern: "single", templates: ["wholesale.v1"],          features: ["crm","inventory","logistics"] },
  { key: "finance",            parent: "tertiary",  orderPattern: "single", templates: ["finance.v1"],            features: ["billing","ledger","compliance"] },
  { key: "hospitality",        parent: "tertiary",  orderPattern: "single", templates: ["hotel.v1","restaurant.v1"], features: ["booking","inventory","staff"] },
  { key: "transport",          parent: "tertiary",  orderPattern: "dual",   templates: ["transport.v1"],          features: ["routing","booking","proofs"], linkedSector: "waste" },
  { key: "media",              parent: "tertiary",  orderPattern: "single", templates: ["media.v1"],              features: ["content","contracts","payments"] },
  { key: "personal-services",  parent: "tertiary",  orderPattern: "single", templates: ["personal-services.v1"],  features: ["schedule","billing","crm"] },

  // 4. Quaternary
  { key: "information-technology", parent: "quaternary", orderPattern: "single", templates: ["it.v1"],            features: ["projects","tickets","billing"] },
  { key: "telecommunications",     parent: "quaternary", orderPattern: "dual",   templates: ["telecom.v1"],       features: ["subscriptions","support","billing"] },
  { key: "research-development",   parent: "quaternary", orderPattern: "single", templates: ["rnd.v1"],           features: ["projects","funding","compliance"] },
  { key: "professional-services",  parent: "quaternary", orderPattern: "single", templates: ["consulting.v1","legal.v1","accounting.v1"], features: ["timesheets","contracts","invoicing"] },

  // 5. Quinary
  { key: "healthcare",         parent: "quinary",   orderPattern: "dual",   templates: ["healthcare.v1"],         features: ["patients","inventory","compliance"] },
  { key: "education",          parent: "quinary",   orderPattern: "single", templates: ["education.v1"],          features: ["courses","attendance","fees"] },
  { key: "government",         parent: "quinary",   orderPattern: "dual",   templates: ["government.v1"],         features: ["tenders","procurement","reporting"] },
  { key: "non-profit",         parent: "quinary",   orderPattern: "single", templates: ["non-profit.v1"],         features: ["donors","projects","reporting"] }
];
`;
}

function sectorsLoaderTs() {
  return `
import { join } from "path";
import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import type { BDOBlueprint } from "./sector.types";

export function loadSectorTemplates(baseDir: string) {
  // baseDir should point to packages/bdo-core/templates
  const sectors: Record<string, { files: BDOBlueprint[] }> = {};
  const sectorDirs = existsSync(baseDir) ? readdirSync(baseDir) : [];
  for (const dir of sectorDirs) {
    const dirPath = join(baseDir, dir);
    if (!statSync(dirPath).isDirectory()) continue;
    const files = readdirSync(dirPath).filter(f => f.endsWith(".json"));
    for (const f of files) {
      const raw = readFileSync(join(dirPath, f), "utf8");
      const bp = JSON.parse(raw) as BDOBlueprint;
      if (!sectors[dir]) sectors[dir] = { files: [] };
      sectors[dir].files.push(bp);
    }
  }
  return sectors;
}
`;
}

function retailTemplate() {
  return JSON.stringify({
    blueprintKey: "retail.v1",
    name: "Retail 28-Day Replenishment",
    channel: "retail",
    cadenceDays: 28,
    orderPattern: "single",
    defaultTerms: "NET30",
    defaultMarginPct: 22,
    workflow: { stages: ["Booking", "Active", "Reporting", "Invoicing"] },
    documentation: { required: ["Delivery Note", "GRV"], generateAuto: true, retainYears: 2 },
    vendorPolicy: { priceLock: true, renewalCycleDays: 28 },
    lines: [
      { sku: "SKU-TEA-500", desc: "Tea 500g", uom: "pack", plannedQty: 120 },
      { sku: "SKU-CUPS",    desc: "Cups Case", uom: "case", plannedQty: 10 }
    ]
  }, null, 2);
}

function restaurantTemplate() {
  return JSON.stringify({
    blueprintKey: "restaurant.v1",
    name: "Restaurant 28-Day Supply",
    channel: "hospitality",
    cadenceDays: 28,
    orderPattern: "single",
    defaultTerms: "NET14",
    defaultMarginPct: 18,
    workflow: { stages: ["Booking", "Active", "Reporting", "Invoicing"] },
    documentation: { required: ["Delivery Note", "GRV"], generateAuto: true, retainYears: 2 },
    vendorPolicy: { priceLock: true, renewalCycleDays: 28 },
    lines: [
      { sku: "FOOD-RICE-25KG", desc: "Rice 25kg", uom: "bag", plannedQty: 20 },
      { sku: "SERV-CLEAN",     desc: "Kitchen Deep Clean", uom: "job", plannedQty: 1 }
    ]
  }, null, 2);
}

function hotelTemplate() {
  return JSON.stringify({
    blueprintKey: "hotel.v1",
    name: "Hotel 28-Day Procurement",
    channel: "hospitality",
    cadenceDays: 28,
    orderPattern: "single",
    defaultTerms: "NET30",
    defaultMarginPct: 20,
    workflow: { stages: ["Booking", "Active", "Reporting", "Invoicing"] },
    documentation: { required: ["Delivery Note"], generateAuto: true, retainYears: 2 },
    vendorPolicy: { priceLock: true, renewalCycleDays: 28 },
    lines: [
      { sku: "LINEN-SET",  desc: "Linen Set", uom: "set", plannedQty: 100 },
      { sku: "TOILETRIES", desc: "Toiletries Pack", uom: "pack", plannedQty: 200 }
    ]
  }, null, 2);
}

function wasteTemplate() {
  return JSON.stringify({
    blueprintKey: "waste.v1",
    name: "Waste Brokerage – Dual Order",
    channel: "waste",
    cadenceDays: 28,
    orderPattern: "dual",
    defaultTerms: "NET15",
    defaultMarginPct: 18,
    linkedBlueprint: "transport.v1",
    workflow: { stages: ["CollectionBooking", "TransportBooking", "Documentation", "Active", "Reporting", "Invoicing"] },
    documentation: { required: ["Waste Transfer Note", "Carrier Licence", "Site Permit"], generateAuto: true, retainYears: 3 },
    vendorPolicy: { priceLock: true, renewalCycleDays: 28 },
    lines: [
      { sku: "MATERIAL-PLASTIC", desc: "Mixed Plastics (tonne)", uom: "tonne", plannedQty: 20 },
      { sku: "MATERIAL-CARDBOARD", desc: "Baled Cardboard (tonne)", uom: "tonne", plannedQty: 15 }
    ]
  }, null, 2);
}

function transportTemplate() {
  return JSON.stringify({
    blueprintKey: "transport.v1",
    name: "Transport – Linked Haulage",
    channel: "transport",
    cadenceDays: 28,
    orderPattern: "dual",
    defaultTerms: "NET30",
    defaultMarginPct: 15,
    linkedBlueprint: "waste.v1",
    workflow: { stages: ["VehicleAssign", "SiteReadiness", "Collection", "Delivery", "Proofs", "Invoice"] },
    documentation: { required: ["Driver Manifest", "Route Sheet", "Delivery Proof"], generateAuto: true, retainYears: 2 },
    vendorPolicy: { priceLock: true, renewalCycleDays: 28 },
    lines: [
      { sku: "SERV-COLLECT", desc: "Waste Collection Trip", uom: "trip", plannedQty: 1 }
    ]
  }, null, 2);
}