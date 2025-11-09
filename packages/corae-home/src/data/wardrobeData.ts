/* ──────────────────────────────────────────────────────────────
   corAe Home — Wardrobe Data (seed)
   Default clothing categories and rotation plan.
   Used by WardrobeTile for daily outfit and laundry tracking.
────────────────────────────────────────────────────────────── */

export interface WardrobeItem {
  id: string;
  category: "top" | "bottom" | "footwear" | "outerwear" | "accessory";
  name: string;
  color?: string;
  lastWorn?: string; // ISO date string
  washable?: boolean;
}

export interface WardrobeRotation {
  day: string;
  items: string[]; // list of WardrobeItem IDs
}

/** Base items — these act as template examples */
export const wardrobeItems: WardrobeItem[] = [
  { id: "t1", category: "top", name: "White T-Shirt", color: "white", washable: true },
  { id: "t2", category: "top", name: "Blue Oxford Shirt", color: "blue", washable: true },
  { id: "b1", category: "bottom", name: "Black Jeans", color: "black", washable: true },
  { id: "b2", category: "bottom", name: "Khaki Chinos", color: "beige", washable: true },
  { id: "f1", category: "footwear", name: "Sneakers", color: "white", washable: false },
  { id: "f2", category: "footwear", name: "Leather Shoes", color: "brown", washable: false },
  { id: "o1", category: "outerwear", name: "Denim Jacket", washable: true },
  { id: "a1", category: "accessory", name: "Watch", washable: false },
];

/** Simple 7-day outfit rotation */
export const wardrobeRotation: WardrobeRotation[] = [
  { day: "Sunday", items: ["t1", "b1", "f1"] },
  { day: "Monday", items: ["t2", "b2", "f2"] },
  { day: "Tuesday", items: ["t1", "b2", "f1", "a1"] },
  { day: "Wednesday", items: ["t2", "b1", "f2"] },
  { day: "Thursday", items: ["t1", "b1", "f1"] },
  { day: "Friday", items: ["t2", "b2", "f2", "a1"] },
  { day: "Saturday", items: ["t1", "b2", "f1", "o1"] },
];

/** Helpers */
export function getWardrobeForDay(day: string): WardrobeItem[] {
  const match = wardrobeRotation.find(
    (r) => r.day.toLowerCase() === day.toLowerCase()
  );
  if (!match) return [];
  return match.items
    .map((id) => wardrobeItems.find((w) => w.id === id))
    .filter(Boolean) as WardrobeItem[];
}