export type SourceTier = "TIER_0" | "TIER_1" | "TIER_2" | "TIER_3" | "TIER_X";

export type SourceCategory =
  | "FAITH"
  | "HEALTH"
  | "MENTAL_HEALTH"
  | "LEGAL"
  | "FINANCE"
  | "TAX"
  | "EDUCATION"
  | "GENERAL";

export interface SourceAuthority {
  id: string;
  name: string;
  tier: SourceTier;
  category: SourceCategory;
  description?: string;
  url?: string;
}

export const BANNED_DOMAINS: string[] = [
  "wikipedia.org",
  "www.wikipedia.org",
];

export function isBannedDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    return BANNED_DOMAINS.some((domain) => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

export function assertSourceTierAllowed(
  tier: SourceTier,
  category: SourceCategory
): void {
  // Example rule: Faith / Health / Legal / Finance may not use Tier 3 or X as primary.
  if (
    (category === "FAITH" ||
      category === "HEALTH" ||
      category === "MENTAL_HEALTH" ||
      category === "LEGAL" ||
      category === "FINANCE" ||
      category === "TAX") &&
    (tier === "TIER_3" || tier === "TIER_X")
  ) {
    throw new Error(
      `Source tier ${tier} is not allowed as a primary source for category ${category}. ` +
        `Use Tier 0, 1 or 2 according to SOURCE_GOVERNANCE_LAW.md.`
    );
  }
}

export const EXAMPLE_AUTHORITIES: SourceAuthority[] = [
  {
    id: "faith-catholic-vatican",
    name: "Vatican / Catechism of the Catholic Church",
    tier: "TIER_1",
    category: "FAITH",
    description: "Official Catholic doctrine and magisterial teaching.",
    url: "https://www.vatican.va",
  },
  {
    id: "health-who",
    name: "World Health Organization",
    tier: "TIER_1",
    category: "HEALTH",
    description: "Global health guidance and standards.",
    url: "https://www.who.int",
  },
];
