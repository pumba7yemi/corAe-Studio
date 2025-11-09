/**
 * Landing pages configuration.
 *
 * Edit this file to add or reorder landing pages for each area (home, business, work).
 * Each entry must have a `slug` (used in the URL) and `title` (shown in the DotNav).
 */

export type LandingPage = { slug: string; title: string; description?: string };

export const LANDING: Record<string, LandingPage[]> = {
  home: [
    { slug: 'pulse', title: 'Pulse', description: 'Live pulse & sync status' },
    { slug: 'main', title: 'Home', description: 'Main home dashboard' },
    { slug: 'extra', title: 'Features', description: 'Highlights & CTA' },
  ],

  business: [
    { slug: 'pulse', title: 'Pulse', description: 'Business pulse & pipeline' },
    { slug: 'main', title: 'Business', description: 'Business landing' },
    { slug: 'extra', title: 'Offerings', description: 'Products & CTA' },
  ],

  work: [
    { slug: 'pulse', title: 'Pulse', description: 'Work pulse & tasks' },
    { slug: 'main', title: 'Work', description: 'Work landing' },
    { slug: 'extra', title: 'Workflow', description: 'Workflow highlights' },
  ],
};

/**
 * Default landing slug for each area. Set to the classic/"extra" page
 * so selecting an area from the three-dot overflow lands on the
 * old/classic view by default.
 */
export const DEFAULT_LANDING: Record<string, string> = {
  home: 'extra',
  business: 'extra',
  work: 'extra',
};

export const DEFAULT_AREA_ORDER = ['home', 'business', 'work'];
