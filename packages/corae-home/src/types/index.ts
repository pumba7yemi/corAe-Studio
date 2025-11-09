/* ──────────────────────────────────────────────────────────────
   corAe Home — Types Index
   Shared type definitions across all Home tiles and data.
────────────────────────────────────────────────────────────── */

export type TileId =
  | "MealPlanner"
  | "CleaningSchedule"
  | "Fitness"
  | "Wardrobe"
  | "GlamAndGlow"
  | "WhatIWant"
  | string;

export interface TileState {
  id: TileId;
  title: string;
  description?: string;
  lastUpdated?: string; // ISO date
  data?: any;
}

/**
 * Minimal interface every tile component should accept.
 * Allows the dashboard grid to map over a common prop set.
 */
export interface TileProps<T = any> {
  id: TileId;
  title: string;
  data?: T;
  onChange?: (next: T) => void;
}

/** Generic item for list rendering (used in multiple tiles) */
export interface SimpleListItem {
  id: string;
  label: string;
  done?: boolean;
  note?: string;
}

/** Persisted layout info (if we later add drag-and-drop dashboards) */
export interface TileLayout {
  id: TileId;
  x: number;
  y: number;
  w: number;
  h: number;
}

/* ── Re-export data model types for convenience ─────────────── */
export type { MealType, DailyMealPlan, MealItem } from "../data/mealPlan";
export type { WardrobeItem, WardrobeRotation } from "../data/wardrobeData";