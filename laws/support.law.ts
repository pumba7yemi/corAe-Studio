// /laws/governance.law.ts
// corAe Constitutional Law — Governance & Strategy

type GovSection = {
  path: string;
  purpose: string;
  requiredFolders?: string[];
};

type GovernanceLawT = {
  name: "Governance Law";
  statement: string;
  sections: GovSection[];
  interfaces: string[];
  validators: {
    policyTraceability: string;
    auditIndependence: string;
  };
  notes?: string[];
};

export const GovernanceLaw: GovernanceLawT = {
  name: "Governance Law",
  statement:
    "Governance sets direction, policies, and oversight. It ensures the QMS works, risks are managed, and objectives align with customer focus.",
  sections: [
    {
      path: "/apps/ship/business/governance/policies",
      purpose: "Corporate policies (security, data, ethics, quality objectives).",
      requiredFolders: ["quality", "security", "ethics", "data"],
    },
    {
      path: "/apps/ship/business/governance/risk",
      purpose: "Enterprise risk register and mitigations.",
      requiredFolders: ["register", "mitigations"],
    },
    {
      path: "/apps/ship/business/governance/audit",
      purpose: "Internal audits, management reviews, certification evidence.",
      requiredFolders: ["internal", "external", "reviews"],
    },
  ],
  interfaces: [
    "Middle-Office: compliance evidence, CAPA follow-through",
    "Support/IT: policy enforcement and access control",
    "Pulse: strategic KPIs and targets",
  ],
  validators: {
    policyTraceability:
      "Every policy must reference applicable standards/regulations and point to evidence locations.",
    auditIndependence:
      "Audit records must be immutable and not editable by the audited function.",
  },
  notes: ["Governance does not store operational data; it sets the rules for it."],
};

export default GovernanceLaw;