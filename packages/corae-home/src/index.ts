/* ──────────────────────────────────────────────────────────────
   corAe Home — package entry
   Exports tiles, data, lib, and types for re-use across apps
────────────────────────────────────────────────────────────── */

export * from "./components/CleaningScheduleTile";
export * from "./components/MealPlanner";
export * from "./components/FitnessTile";
export * from "./components/WardrobeTile";
export * from "./components/GlamAndGlowTile";
export * from "./components/WhatIWantTile";

// grouped exports
export * as HomeData from "./data";
export * as HomeLib from "./lib";
export * as HomeTypes from "./types";