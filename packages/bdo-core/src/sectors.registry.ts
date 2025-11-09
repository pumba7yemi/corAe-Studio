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

