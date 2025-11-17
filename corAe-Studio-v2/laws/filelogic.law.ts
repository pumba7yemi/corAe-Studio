// /laws/filelogic.law.ts
// corAe Constitutional Law — FileLogic (meta-law)

type Enforcement = {
  immutability: boolean;
  forwardOnlyBaton: boolean;
  singleSourceOfTruth: boolean;
  humanDiscoverable: boolean;
};

type NamingRule = {
  name: string;
  statement: string;
  examples?: string[];
};

type PathRule = {
  area:
    | "apps"
    | "packages"
    | "laws"
    | "rules"
    | "flows"
    | "contexts"
    | "prisma"
    | "public"
    | "data";
  must: string[];
  mustNot?: string[];
};

type VersioningPolicy = {
  scheme: "semantic" | "calendar" | "numerological";
  note: string;
};

type FileLogicLawT = {
  name: "FileLogic Constitutional Law";
  statement: string;
  enforcement: Enforcement;
  naming: NamingRule[];
  paths: PathRule[];
  versioning: VersioningPolicy;
  validators: {
    pathLinter: string;
    namingLinter: string;
    batonChecker: string;
  };
  notes?: string[];
};

export const FileLogicLaw: FileLogicLawT = {
  name: "FileLogic Constitutional Law",
  statement:
    "corAe repositories are organized for instant human discoverability and machine validation. Every concept has one canonical home; artifacts are immutable once issued; equals '=' snapshots form a forward-only baton through systems like OBARI.",
  enforcement: {
    immutability: true,
    forwardOnlyBaton: true,
    singleSourceOfTruth: true,
    humanDiscoverable: true,
  },
  naming: [
    {
      name: "Singular category roots",
      statement:
        "Use singular for category roots that represent a concept (e.g., 'deal', 'order'); use plural only when the path semantically lists many items.",
      examples: [
        "✅ /apps/ship/business/oms/obari/deal/bdo",
        "❌ /apps/ship/business/oms/obari/deals/bdo",
      ],
    },
    {
      name: "OBARI stage-first",
      statement:
        "Inside OBARI, stage folders are canonical: order → booking → active → reporting → invoicing.",
      examples: [
        "✅ /apps/ship/business/oms/obari/booking/create",
        "✅ /apps/ship/business/oms/obari/reporting/finalize",
        "✅ /apps/ship/business/oms/obari/invoicing/issue",
      ],
    },
    {
      name: "No aliases in constitutional files",
      statement:
        "Law files and path-critical endpoints must not import via path aliases (e.g., '@/…'). Prefer local types or direct packages.",
    },
  ],
  paths: [
    {
      area: "laws",
      must: [
        "Contain constitutional (non-negotiable) domain laws as top-level siblings",
        "No runtime imports; plain TS objects only",
      ],
      mustNot: ["No nested 'FileLogic' directory; FileLogic is a concept, not a folder"],
    },
    {
      area: "rules",
      must: ["Contain applied operational rules (optional)", "Reference only existing laws"],
    },
    {
      area: "flows",
      must: ["Describe stage transitions in plain data (JSON/TS)", "Mirror human sequence"],
    },
    {
      area: "contexts",
      must: ["Declare environment/role scopes (business, home, work)", "Avoid secrets"],
    },
    {
      area: "apps",
      must: ["Implement runtime behavior that conforms to laws", "No duplication of laws/rules"],
    },
    {
      area: "prisma",
      must: ["Group schemas by domain (e.g., obari.prisma, finance.prisma)"],
    },
    {
      area: "public",
      must: ["Static assets only (uploads, generated PDFs)"],
    },
    {
      area: "data",
      must: ["Write-once content-addressed stores for snapshots (e.g., .data/equals-*)"],
    },
  ],
  versioning: {
    scheme: "semantic",
    note:
      "Prefer SemVer for code packages; allow calendar or numerological notations in documents where historically required.",
  },
  validators: {
    pathLinter:
      "Walk tree and assert each concept exists in one canonical path; reject duplicates or pluralized forks of singular roots.",
    namingLinter:
      "Ensure stage-first naming in domain paths; reject alias-based imports in constitutional files.",
    batonChecker:
      "Verify that equals snapshots form a forward-only chain: base '=' → REPORT_ADJUSTED → FINAL; no rewrites permitted.",
  },
  notes: [
    "FileLogic is the constitution — it governs everything but is not a folder itself.",
    "Laws define boundaries; rules define procedures; flows encode human sequence; contexts scope variables.",
    "OBARI stage names are canonical: order → booking → active → reporting → invoicing.",
  ],
};

export default FileLogicLaw;