/* ──────────────────────────────────────────────────────────────
   corAe Home — Meal Plan (seed)
   Default template for Meal Planner tile.
   Can be replaced by user data via local storage or Finance bridge.
────────────────────────────────────────────────────────────── */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealItem {
  name: string;
  notes?: string;
  ingredients?: string[];
}

export interface DailyMealPlan {
  day: string; // e.g. "Sunday"
  meals: Record<MealType, MealItem>;
}

/** Default 7-day cycle */
export const mealPlan: DailyMealPlan[] = [
  {
    day: "Sunday",
    meals: {
      breakfast: { name: "Oatmeal & Fruit", notes: "Light and filling" },
      lunch: { name: "Grilled Chicken Salad", notes: "Use leftovers if any" },
      dinner: { name: "Vegetable Curry with Rice", notes: "Cook for 2 days" },
      snack: { name: "Dates & Nuts" },
    },
  },
  {
    day: "Monday",
    meals: {
      breakfast: { name: "Eggs & Toast" },
      lunch: { name: "Fish with Steamed Veg" },
      dinner: { name: "Chicken Soup", notes: "Simple detox meal" },
      snack: { name: "Fruit Smoothie" },
    },
  },
  {
    day: "Tuesday",
    meals: {
      breakfast: { name: "Porridge with Honey" },
      lunch: { name: "Beef Stir-Fry" },
      dinner: { name: "Pasta with Tomato Sauce" },
      snack: { name: "Granola Bar" },
    },
  },
  {
    day: "Wednesday",
    meals: {
      breakfast: { name: "Yogurt & Berries" },
      lunch: { name: "Veg Wrap" },
      dinner: { name: "Grilled Fish with Salad" },
      snack: { name: "Tea & Biscuits" },
    },
  },
  {
    day: "Thursday",
    meals: {
      breakfast: { name: "Avocado Toast" },
      lunch: { name: "Chicken Shawarma Bowl" },
      dinner: { name: "Stir-fried Noodles" },
      snack: { name: "Mixed Nuts" },
    },
  },
  {
    day: "Friday",
    meals: {
      breakfast: { name: "Paratha & Tea" },
      lunch: { name: "Grilled Kebabs" },
      dinner: { name: "Seafood Curry" },
      snack: { name: "Fruit Salad" },
    },
  },
  {
    day: "Saturday",
    meals: {
      breakfast: { name: "Pancakes & Maple Syrup" },
      lunch: { name: "Burger or Wrap" },
      dinner: { name: "Roast Chicken & Veg" },
      snack: { name: "Chocolate Treat" },
    },
  },
];

/** Helper function for lookup */
export function getMealFor(day: string, type: MealType): MealItem | undefined {
  const plan = mealPlan.find((d) => d.day.toLowerCase() === day.toLowerCase());
  return plan?.meals[type];
}