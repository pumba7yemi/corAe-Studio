/* ──────────────────────────────────────────────────────────────
   corAe Home — Product Partners
   Links home lifestyle categories to potential vendor or brand partners.
   Used for discovery or marketplace integration (read-only seed data).
────────────────────────────────────────────────────────────── */

export interface ProductPartner {
  id: string;
  category: "groceries" | "fitness" | "beauty" | "laundry" | "homecare" | "wellness";
  name: string;
  tagline?: string;
  link?: string;
  region?: string;
}

export const productPartners: ProductPartner[] = [
  {
    id: "choiceplus",
    category: "groceries",
    name: "Choice Plus Supermarket",
    tagline: "Fresh, affordable, community-first groceries.",
    link: "https://choiceplus.app",
    region: "UAE",
  },
  {
    id: "glamglow",
    category: "beauty",
    name: "Glam & Glow Salon",
    tagline: "Personal care and confidence redefined.",
    region: "UAE",
  },
  {
    id: "grogu",
    category: "wellness",
    name: "Grogu Meal Prep",
    tagline: "Nutritious, pet-safe meal planning.",
    region: "UAE",
  },
  {
    id: "gracegrit",
    category: "fitness",
    name: "Grace & Grit",
    tagline: "Activewear for real movement.",
    link: "https://gracegrit.co",
  },
  {
    id: "baretheory",
    category: "beauty",
    name: "Bare Theory",
    tagline: "Clean skincare, effortless confidence.",
  },
  {
    id: "greenflow",
    category: "homecare",
    name: "Green Flow",
    tagline: "Eco-friendly cleaning solutions for everyday life.",
  },
];

export function getPartnersByCategory(cat: ProductPartner["category"]): ProductPartner[] {
  return productPartners.filter((p) => p.category === cat);
}