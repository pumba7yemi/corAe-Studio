export type PrayerIntent =
  | 'provision'
  | 'healing'
  | 'protection'
  | 'guidance'
  | 'deliverance'
  | 'vocation'
  | 'family'
  | 'business'
  | 'debtRelief'
  | 'housing'
  | 'relationships';

export type PrayerCategory =
  | 'novena'
  | 'litany'
  | 'devotion'
  | 'personal'
  | 'chaplet'
  | 'rosary';

export type PrayerBlockKind =
  | 'title'
  | 'subtitle'
  | 'line'
  | 'callResponse'
  | 'instruction'
  | 'link'
  | 'signOfCross'
  | 'amen';

export type PrayerBlock = {
  kind: PrayerBlockKind;
  text?: string;
  id?: string;
};

export type PrayerDoc = {
  slug: string;
  title: string;
  category: PrayerCategory;
  series?: { name: string; day?: number; totalDays?: number } | null;
  source?: string | null;
  audioUrl?: string | null;
  createdISO?: string;
  blocks: PrayerBlock[];
  scriptureRefs?: string[];
  copyrightNote?: string | null;
};

export type GracePrep = {
  confessionRecent?: boolean;
  forgiveOthers?: boolean;
  restitutionPlanned?: boolean;
  removeOccultSuperstition?: boolean;
  fastingOrAlmsgiving?: boolean;
  reconciliationAttempted?: boolean;
  gratitudePracticed?: boolean;
  scriptureMeditated?: boolean;
  humilityAndTrust?: boolean;
};

export type JournalEntry = {
  dateISO: string;
  intent?: PrayerIntent;
  prep?: GracePrep;
  scriptures?: string[];
  items?: Array<{ id: string; value: string }>;
  tailoredPrayer?: string;
  librarySlug?: string;
};
