/* ──────────────────────────────────────────────────────────────
   corAe Home — Home Flow Manifesto (seed)
   Defines the default daily rhythm for the Home dashboard.
   Pure data (no imports) so it can be consumed by any app.
────────────────────────────────────────────────────────────── */

export type HomeFlowSectionId = "morning" | "day" | "evening";

/**
 * Each section lists tile IDs (string keys) that the consuming app
 * can map to actual components (MealPlanner, Cleaning, etc.).
 * Keep IDs stable; apps may persist user customisations against them.
 */
export type HomeFlowSection = {
  id: HomeFlowSectionId;
  title: string;
  tiles: string[]; // component IDs or logical keys
  note?: string;
};

/**
 * Default flow: Peace → Perspective → Practice, mirrored for home life.
 */
export const homeFlowManifesto: HomeFlowSection[] = [
  {
    id: "morning",
    title: "Morning",
    tiles: [
      "Faith.MorningAnchor",     // optional integration with Faith module
      "MealPlanner",             // plan first meal / grocery check
      "WhatIWant",               // 1 intention for the day (desire → decision)
    ],
    note:
      "Begin light. One verse or reflection, one small plan, one intention. Keep screens quiet until these are done.",
  },
  {
    id: "day",
    title: "Day",
    tiles: [
      "CleaningSchedule",        // micro chores/checklist
      "Fitness",                 // move the body; short session acceptable
      "Wardrobe",                // outfit / laundry flow when needed
      "GlamAndGlow",             // personal care / appointments
    ],
    note:
      "Live in rhythm, not rush. Favour small, consistent actions over sporadic big efforts.",
  },
  {
    id: "evening",
    title: "Evening",
    tiles: [
      "MealPlanner.Evening",     // dinner & next-day prep
      "Faith.NightExamen",       // gratitude + release (optional Faith tie-in)
      "WhatIWant.Review",        // close the loop; carry 1 item to tomorrow
    ],
    note:
      "Close gently. Gratitude, release, and one prepared step for tomorrow.",
  },
] as const;

/** Helper: flat list of tile keys in display order (useful for dashboards) */
export const homeFlowTileOrder: string[] = [
  ...homeFlowManifesto[0].tiles,
  ...homeFlowManifesto[1].tiles,
  ...homeFlowManifesto[2].tiles,
];