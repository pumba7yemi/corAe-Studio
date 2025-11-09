export type ID = string;

export interface Task {
  id: ID;
  title: string;
  due?: string;
  source?: "email" | "manual" | "system";
  priority?: 1 | 2 | 3;
  completed?: boolean;
}

export interface MealPlanDay {
  date: string;
  lunch: string;
  dinner: string;
  notes?: string;
}

export interface PantryItem {
  name: string;
  qty: number;
  threshold: number;
  unit?: string;
}

export interface Partner {
  id: ID;
  name: string;
  kind: "grocer" | "laundry" | "cleaning" | "maintenance" | "beauty" | "fitness";
  region?: string;
  rating?: number;
}

export interface FlowTileProps {
  title: string;
  children?: React.ReactNode;
  pulse?: boolean;
}
