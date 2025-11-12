// packages/core-ascend/src/index.ts
const readShipMemory: (scope: string) => Promise<any> =
  (globalThis as any).readShipMemory ??
  (globalThis as any).caia?.readShipMemory ??
  (async () => undefined);

/** Domains we care about for alignment */
export type ContractDomain = "home" | "work" | "business";

export type AuditEntry = {
  id: string;
  domain: ContractDomain;
  checkedPledges: string[];
  reflection?: string;
  createdAt: string; // ISO
};

export type AlignmentSummary = {
  home: boolean;
  work: boolean;
  business: boolean;
  latestByDomain: Partial<Record<ContractDomain, string>>; // ISO date
};

const SCOPE = "social-contract-audit";
const KEY = "entries";

/** Load audits from CAIA ship memory (returns [] if none). */
export async function loadAudits(): Promise<AuditEntry[]> {
  try {
    const raw = await readShipMemory(SCOPE as any);
    const entriesJson = (raw?.[KEY] as string) || "[]";
    const entries = JSON.parse(entriesJson) as AuditEntry[];
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

/** True if each domain has at least one audit with ≥1 checked pledge. */
export async function hasSignedSocialContract(): Promise<boolean> {
  const s = await getAlignmentSummary();
  return s.home && s.work && s.business;
}

/** Compute per-domain alignment + last audit timestamp by domain. */
export async function getAlignmentSummary(): Promise<AlignmentSummary> {
  const entries = await loadAudits();

  const byDomain: Record<ContractDomain, AuditEntry[]> = {
    home: [],
    work: [],
    business: [],
  };

  for (const e of entries) {
    if (e && (e.domain === "home" || e.domain === "work" || e.domain === "business")) {
      byDomain[e.domain].push(e);
    }
  }

  const pick = (d: ContractDomain) => {
    const list = byDomain[d].filter(e => Array.isArray(e.checkedPledges) && e.checkedPledges.length > 0);
    const aligned = list.length > 0;
    const latestIso = aligned
      ? list
          .map(e => e.createdAt)
          .filter(Boolean)
          .sort()
          .at(-1) || undefined
      : undefined;
    return { aligned, latestIso };
  };

  const h = pick("home");
  const w = pick("work");
  const b = pick("business");

  return {
    home: h.aligned,
    work: w.aligned,
    business: b.aligned,
    latestByDomain: {
      home: h.latestIso,
      work: w.latestIso,
      business: b.latestIso,
    },
  };
}
