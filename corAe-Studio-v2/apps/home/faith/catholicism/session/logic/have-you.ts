// Local minimal types to avoid cross-package path resolution during scaffold.
type PrayerIntent = string;
type GracePrep = Record<string, boolean>;

export function buildTailoredPrayer(intent?: PrayerIntent) {
  if (!intent) return 'Lord, hear our prayer.';
  return `Lord, we pray for ${intent}. May your will be done.`;
}

export function defaultPrep(): GracePrep {
  return {
    confessionRecent: false,
    forgiveOthers: false,
    restitutionPlanned: false,
    removeOccultSuperstition: false,
    fastingOrAlmsgiving: false,
    reconciliationAttempted: false,
    gratitudePracticed: false,
    scriptureMeditated: false,
    humilityAndTrust: true,
  };
}
