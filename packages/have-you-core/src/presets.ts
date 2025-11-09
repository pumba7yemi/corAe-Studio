import { HaveYouItem } from "./types.js";
import { alwaysReady, weeklyWindow } from "./rules.js";

// ULID-like static ids for deterministic seeds
const id = (s: string) => `hy_${s.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase()}`;

export const HOME_PRESET: HaveYouItem[] = [
  {
    id: id("HOME.PANTRY.ROTATE"),
    domain: "HOME",
    code: "HOME.PANTRY.ROTATE",
    title: "Rotate pantry stock (oldest to back)",
    cadence: "WEEKLY",
    rule: weeklyWindow(6), // Saturday
    tags: ["HOME", "FOOD", "COMPLIANCE"]
  },
  {
    id: id("HOME.MEAL.PREP"),
    domain: "HOME",
    code: "HOME.MEAL.PREP",
    title: "Meal plan & prep (7 days)",
    cadence: "WEEKLY",
    rule: weeklyWindow(6),
    requires: [id("HOME.PANTRY.ROTATE")]
  },
  {
    id: id("HOME.BILLS.REVIEW"),
    domain: "HOME",
    code: "HOME.BILLS.REVIEW",
    title: "Review bills & due payments",
    cadence: "MONTHLY",
    rule: alwaysReady
  }
];

export const WORK_PRESET: HaveYouItem[] = [
  {
    id: id("WORK.OPENING.CHECKLIST"),
    domain: "WORK",
    code: "WORK.OPENING.CHECKLIST",
    title: "Opening checklist (greet customers, follow-ups, GRV reminder)",
    cadence: "DAILY",
    rule: alwaysReady,
    tags: ["CHOICE_PLUS", "TEAM"]
  },
  {
    id: id("WORK.CASH.ALLOCATION"),
    domain: "WORK",
    code: "WORK.CASH.ALLOCATION",
    title: "Allocate cash for today's POs (per 28-day cycle policy)",
    cadence: "DAILY",
    rule: alwaysReady,
    requires: [id("WORK.OPENING.CHECKLIST")]
  }
];

export const BUSINESS_PRESET: HaveYouItem[] = [
  {
    id: id("BUSINESS.28DAY.EXPIRY.CHECK"),
    domain: "BUSINESS",
    code: "BUSINESS.28DAY.EXPIRY.CHECK",
    title: "28-Day Cycle – Expiry & PO stock check",
    cadence: "28DAY",
    rule: alwaysReady,
    tags: ["PURCHASING", "COMPLIANCE"]
  },
  {
    id: id("BUSINESS.VENDOR.WALKIN.BRIEF"),
    domain: "BUSINESS",
    code: "BUSINESS.VENDOR.WALKIN.BRIEF",
    title: "Daily brief: Walk-in vendors (chilled/dairy/bakery/produce)",
    cadence: "DAILY",
    rule: alwaysReady,
    requires: [id("BUSINESS.28DAY.EXPIRY.CHECK")]
  }
];

export const PRESETS = {
  HOME: HOME_PRESET,
  WORK: WORK_PRESET,
  BUSINESS: BUSINESS_PRESET
};