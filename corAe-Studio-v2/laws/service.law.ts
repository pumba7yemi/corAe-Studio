// /laws/service.law.ts
// corAe Constitutional Law — Service & Delivery (Operations)

type ServiceSubdomain = {
  path: string;
  purpose: string;
  requiredFolders?: string[];
  constraints?: string[];
};

type ServiceLawT = {
  name: "Service & Delivery Law";
  statement: string;
  subdomains: ServiceSubdomain[];
  interfaces: string[];
  validators: {
    obariBridge: string;
    qualityAssurance: string;
  };
  notes?: string[];
};

export const ServiceLaw: ServiceLawT = {
  name: "Service & Delivery Law",
  statement:
    "Service & Delivery turns orders into outcomes. It includes PMO, Delivery Ops, R&D, and QA. Execution aligns to OBARI stages for traceability.",
  subdomains: [
    {
      path: "/apps/ship/business/service/projects",
      purpose: "PMO: programs, projects, milestones, RAID logs.",
      requiredFolders: ["portfolio", "projects", "milestones", "raids"],
    },
    {
      path: "/apps/ship/business/service/delivery",
      purpose: "Operational delivery workflows and SOPs.",
      requiredFolders: ["workflows", "sops", "runbooks"],
    },
    {
      path: "/apps/ship/business/service/r_and_d",
      purpose: "Research & development, prototypes, experiments.",
      requiredFolders: ["experiments", "prototypes"],
      constraints: ["No production data; masked datasets only."],
    },
    {
      path: "/apps/ship/business/service/qa",
      purpose: "Quality control, acceptance criteria, test evidence.",
      requiredFolders: ["checklists", "evidence", "nonconformities"],
      constraints: ["Nonconformities must raise Middle-Office quality events."],
    },
  ],
  interfaces: [
    "OBARI: 'active' stage execution and evidence capture",
    "Pulse: delivery KPIs (TTR, throughput, SLA compliance)",
    "Middle-Office: quality audits, CAPA",
  ],
  validators: {
    obariBridge:
      "Every project/delivery record must reference an OBARI order/active ID or an approved R&D exception.",
    qualityAssurance:
      "QA evidence required for acceptance; nonconformities logged and tracked to closure.",
  },
  notes: ["Service runs the work; OBARI tracks the work; Pulse reports the work."],
};

export default ServiceLaw;