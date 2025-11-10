export type ContractDomain = "home" | "work" | "business";

export type Pledge = {
  id: string;
  label: string;
  mandatory?: boolean;
};

export type AuditEntry = {
  id: string;
  domain: ContractDomain;
  timestamp: string;
  checkedPledges: string[];
  pass: boolean;
  reflection?: string;
  actor?: { userId?: string };
};

export const PLEDGES: Record<ContractDomain, Pledge[]> = {
  home: [
    { id: "self-respect", label: "Respect myself in speech, diet, and discipline", mandatory: true },
    { id: "neighbour", label: "Be considerate to neighbours and community" },
    { id: "cleanliness", label: "Keep my home and shared spaces clean", mandatory: true },
    { id: "gratitude", label: "Practice gratitude and restraint" },
  ],
  work: [
    { id: "value-over-hours", label: "Deliver value, not just hours", mandatory: true },
    { id: "owner-extension", label: "Act as an extension of the owner’s effort" },
    { id: "craft", label: "Improve my craft weekly", mandatory: true },
    { id: "respect-ops", label: "Respect teammates, customers, and time" },
  ],
  business: [
    { id: "structure", label: "Provide structure, clarity, and fair process", mandatory: true },
    { id: "environment", label: "Create an environment for partners to excel", mandatory: true },
    { id: "integrity", label: "Enforce integrity and cleanliness standards" },
    { id: "customer", label: "Protect customers’ dignity and time" },
  ],
};
