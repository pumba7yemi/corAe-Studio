// /laws/commercial.law.ts
// corAe Constitutional Law — Commercial (Front Office)

type SubdomainRule = {
  path: string;
  purpose: string;
  requiredFolders?: string[];
  constraints?: string[];
};

type ValidatorHints = {
  placementChecker: string;
  dataSOT: string; // single source of truth expectations
  kpiContract: string;
};

type CommercialLawT = {
  name: "Commercial Law";
  statement: string;
  subdomains: SubdomainRule[];
  interfaces: string[]; // integrations/contracts with other domains
  validators: ValidatorHints;
  notes?: string[];
};

export const CommercialLaw: CommercialLawT = {
  name: "Commercial Law",
  statement:
    "Commercial houses all revenue-facing functions: Sales, CRM, Marketing, Partnerships, and Customer Success. CRM is the system of record for customer entities and interactions.",
  subdomains: [
    {
      path: "/apps/ship/business/commercial/crm",
      purpose: "Customer system of record: Leads, Accounts, Contacts, Activities, Cases.",
      requiredFolders: ["leads", "accounts", "contacts", "activities", "service"],
      constraints: [
        "No finance data beyond deal values and terms; invoicing belongs to OBARI/Finance.",
        "PII handling must follow Support/IT security policies.",
      ],
    },
    {
      path: "/apps/ship/business/commercial/sales",
      purpose: "Pipeline, opportunities, quotations, contracts (pre-OBARI order).",
      requiredFolders: ["pipeline", "quotes", "contracts"],
      constraints: [
        "When a contract is executed, create an OBARI 'order' record; do not duplicate contract storage.",
      ],
    },
    {
      path: "/apps/ship/business/commercial/marketing",
      purpose:
        "Brand (strategy, identity, PR) and Performance (campaigns, channels, attribution).",
      requiredFolders: ["brand", "performance", "content"],
      constraints: [
        "Brand assets are authoritative here; delivery copies live under Service 'content' if needed.",
        "Performance reports feed Pulse KPIs; raw logs stored per IT data policy.",
      ],
    },
    {
      path: "/apps/ship/business/commercial/partnerships",
      purpose: "Alliances, channel partners, vendor marketing agreements.",
      requiredFolders: ["partners", "agreements"],
    },
    {
      path: "/apps/ship/business/commercial/service",
      purpose: "Customer Success / Support (tickets) aligned with CRM Accounts.",
      requiredFolders: ["tickets", "sla", "runbooks"],
      constraints: ["Operational fixes execute via Service/Delivery or OBARI 'active' stage."],
    },
  ],
  interfaces: [
    "OBARI: sales/contracts → order creation",
    "Pulse: revenue KPIs, conversion, NPS",
    "Support/IT: CRM data security, backups, identity",
  ],
  validators: {
    placementChecker:
      "CRM and Marketing must remain under /commercial. Reject placement under /support or /service.",
    dataSOT:
      "Accounts/Contacts live only in CRM; other domains reference by ID. No shadow customer lists.",
    kpiContract:
      "Expose revenue, conversion, CAC, NPS to Pulse via defined read models; no ad-hoc spreadsheets.",
  },
  notes: [
    "Customer Success 'tickets' are customer-facing but operational execution may sit in Service.",
    "Contracts are the last step before OBARI 'order'.",
  ],
};

export default CommercialLaw;