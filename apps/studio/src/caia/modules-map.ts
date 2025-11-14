export type CorAeLayer = 'home' | 'work' | 'business';

export interface CorAeModule {
  id: string;      // e.g. "home.glam"
  name: string;    // human label
  order: number;   // sort order
  core: boolean;
  // optional route to the module's root page (e.g. "/ship/home")
  path?: string;
}

export type CorAeModuleMap = Record<CorAeLayer, CorAeModule[]>;

export const MODULES: CorAeModuleMap = {
  home: [
    { id: 'home.core',       name: 'Home OS',                 order: 0,  core: true, path: '/ship/home' },
    { id: 'home.focus',     name: 'HomeFocus OS',            order: 1,  core: true },
    { id: 'home.faith',     name: 'Faith OS',                order: 2,  core: true },
    { id: 'home.glam',      name: 'Glam & Glow',             order: 3,  core: true },
    { id: 'home.cleaning',  name: 'Home Cleaning OS',        order: 4,  core: true },
    { id: 'home.meals',     name: 'Meals & Home Management', order: 5,  core: true },
    { id: 'home.childcare', name: 'Childcare & Family',      order: 6,  core: true },
    { id: 'home.finance',   name: 'Home Finance OS',         order: 7,  core: true },
    { id: 'home.health',    name: 'Health & Fitness',        order: 8,  core: true },
    { id: 'home.travel',    name: 'Travel & Memories',       order: 9,  core: true },
    { id: 'home.pets',      name: 'Pets & Household Care',   order: 10, core: true },
    { id: 'home.safety',    name: 'Safety & Emergency OS',   order: 11, core: true },
    { id: 'home.docs',      name: 'Home Docs & Receipts',    order: 12, core: true },
  ],
  work: [
    { id: 'work.core',       name: 'Work OS',                 order: 0,  core: true, path: '/ship/work/pulse' },
    { id: 'work.focus',  name: 'WorkFocus OS',        order: 1, core: true },
    { id: 'work.cims',   name: 'CIMS (Work)',         order: 2, core: true },
    { id: 'work.diary',  name: '3³DTD (Work)',        order: 3, core: true },
    { id: 'work.tasks',  name: 'Task Engine',         order: 4, core: true },
  ],
  business: [
    { id: 'business.core',    name: 'Business OS',          order: 1, core: true, path: '/ship/business/oms' },
    { id: 'business.finance', name: 'Finance OS',           order: 2, core: true },
    { id: 'business.hr',      name: 'HR OS',                order: 3, core: true },
    { id: 'business.obari',   name: 'OBARI OMS',            order: 4, core: true },
    { id: 'business.reserve', name: 'Reserve Engine',       order: 5, core: true },
    { id: 'business.cims',    name: 'CIMS (Business)',      order: 6, core: true },
    { id: 'business.diary',   name: '3³DTD (Business)',     order: 7, core: true },
  ],
};

export function modulesFor(layer: CorAeLayer): CorAeModule[] {
  return MODULES[layer].slice().sort((a, b) => a.order - b.order);
}

// Note: Cleaning is available both under `home.cleaning` and within the
// Business/ops stack (represented by `business.obari` + related pages).
// Glam & Glow is intentionally a Home personal-care module (`home.glam`).
