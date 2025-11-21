export type ShipGovernanceProfile = "STRICT" | "STANDARD" | "LAB";

export interface ShipGovernanceLimits {
  maxActiveFlows: number;
  maxActiveDashboards: number;
}

export interface ShipGovernanceConfig {
  id: string;
  name: string;
  profile: ShipGovernanceProfile;
  allowSensitiveCategories: boolean;
  allowedSensitiveCategories?: string[];
  overrides?: Partial<ShipGovernanceLimits>;
}

export const DEFAULT_PROFILE_LIMITS: Record<ShipGovernanceProfile, ShipGovernanceLimits> = {
  STRICT: { maxActiveFlows: 10, maxActiveDashboards: 5 },
  STANDARD: { maxActiveFlows: 50, maxActiveDashboards: 20 },
  LAB: { maxActiveFlows: 200, maxActiveDashboards: 100 },
};

export function getEffectiveLimits(
  profile: ShipGovernanceProfile,
  overrides?: Partial<ShipGovernanceLimits>
) {
  const base = DEFAULT_PROFILE_LIMITS[profile];
  return {
    maxActiveFlows: overrides?.maxActiveFlows ?? base.maxActiveFlows,
    maxActiveDashboards: overrides?.maxActiveDashboards ?? base.maxActiveDashboards,
  };
}

export function assertShipWithinLimits(opts: {
  profile: ShipGovernanceProfile;
  activeFlows: number;
  activeDashboards: number;
  overrides?: Partial<ShipGovernanceLimits>;
}) {
  const limits = getEffectiveLimits(opts.profile, opts.overrides);
  if (opts.activeFlows > limits.maxActiveFlows) {
    throw new Error(
      `Ship exceeded maxActiveFlows for profile ${opts.profile}: ` +
        `${opts.activeFlows} > ${limits.maxActiveFlows}. Archive or merge flows.`
    );
  }
  if (opts.activeDashboards > limits.maxActiveDashboards) {
    throw new Error(
      `Ship exceeded maxActiveDashboards for profile ${opts.profile}: ` +
        `${opts.activeDashboards} > ${limits.maxActiveDashboards}. Archive or merge dashboards.`
    );
  }
}
