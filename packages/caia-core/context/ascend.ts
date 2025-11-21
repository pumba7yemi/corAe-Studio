export type AscendStage = "HOME" | "WORK" | "BUSINESS" | "CREATOR";
export type AscendLens = "GRINDER" | "BALANCED" | "DREAMER";
export type AscendMode = "ASCEND" | "DIRECT";

export type SalesAgentTier = "NONE" | "LEARNER" | "ACTIVE" | "PRO";

export interface FinancialBaseline {
  /** 0–100: how healthy cash flow and obligations are */
  cashFlowHealth: number;
  /** 0–100: perceived shortfall risk */
  shortfallRisk: number;
  /** minutes of life effectively “purchasable” per currency unit */
  timePurchasablePerUnit: number;
}

export interface SalesAgentStats {
  tier: SalesAgentTier;
  leadsContacted: number;
  dealsClosed: number;
  commissionEarned: number;
}

export interface AscendProfile {
  userId: string;
  stage: AscendStage;
  lens: AscendLens;
  mode: AscendMode;
  /** finance as fuel */
  financialBaseline: FinancialBaseline;
  /** total minutes corAe has reclaimed through automation */
  timeReclaimedMinutes: number;
  /** total income earned specifically through Ascend-linked paths (e.g. sales agent) */
  incomeEarned: number;
  /** 0–100 composite indicator of “flow vs chaos” */
  flowScore: number;
  /** sales agent pathway stats */
  salesAgent: SalesAgentStats;
  /** ISO timestamp */
  lastUpdated: string;
}

/**
 * Default profile for a new user entering Ascend.
 * Stage = HOME: we always start by stabilising home life.
 */
export function createDefaultAscendProfile(userId: string): AscendProfile {
  const now = new Date().toISOString();
  return {
    userId,
    stage: "HOME",
    lens: "GRINDER",
    mode: "ASCEND",
    financialBaseline: {
      cashFlowHealth: 40,
      shortfallRisk: 60,
      timePurchasablePerUnit: 0,
    },
    timeReclaimedMinutes: 0,
    incomeEarned: 0,
    flowScore: 30,
    salesAgent: {
      tier: "NONE",
      leadsContacted: 0,
      dealsClosed: 0,
      commissionEarned: 0,
    },
    lastUpdated: now,
  };
}

/**
 * Simple in-memory store.
 * This keeps the types and API clean while you wire in a real DB later.
 */
const ASCEND_STORE = new Map<string, AscendProfile>();

export async function getAscendProfile(
  userId: string
): Promise<AscendProfile> {
  let profile = ASCEND_STORE.get(userId);
  if (!profile) {
    profile = createDefaultAscendProfile(userId);
    ASCEND_STORE.set(userId, profile);
  }
  return profile;
}

export type AscendProfileUpdate = Partial<
  Omit<AscendProfile, "userId" | "lastUpdated">
>;

export async function updateAscendProfile(
  userId: string,
  patch: AscendProfileUpdate
): Promise<AscendProfile> {
  const current = await getAscendProfile(userId);

  const next: AscendProfile = {
    ...current,
    ...patch,
    financialBaseline: {
      ...current.financialBaseline,
      ...(patch.financialBaseline ?? {}),
    },
    salesAgent: {
      ...current.salesAgent,
      ...(patch.salesAgent ?? {}),
    },
    lastUpdated: new Date().toISOString(),
  };

  ASCEND_STORE.set(userId, next);
  return next;
}

/**
 * Utility: update time reclaimed in minutes.
 */
export async function addTimeReclaimed(
  userId: string,
  minutes: number
): Promise<AscendProfile> {
  const current = await getAscendProfile(userId);
  return updateAscendProfile(userId, {
    timeReclaimedMinutes: Math.max(
      0,
      current.timeReclaimedMinutes + Math.max(0, minutes)
    ),
  });
}

/**
 * Utility: register Ascend-linked income (e.g. sales commission).
 */
export async function addAscendIncome(
  userId: string,
  amount: number
): Promise<AscendProfile> {
  const current = await getAscendProfile(userId);
  return updateAscendProfile(userId, {
    incomeEarned: Math.max(0, current.incomeEarned + Math.max(0, amount)),
  });
}

/**
 * Utility: update flowScore safely in 0–100 range.
 */
export async function setFlowScore(
  userId: string,
  score: number
): Promise<AscendProfile> {
  const value = Math.max(0, Math.min(100, Math.round(score)));
  return updateAscendProfile(userId, { flowScore: value });
}
