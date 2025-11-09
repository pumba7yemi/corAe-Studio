/* ──────────────────────────────────────────────────────────────
   corAe Constitutional Law — Time
   Location: /laws/time.law.ts
   Classification: Supreme Law · Temporal Constitution
   Linked Modules: 3³DTD · OBARI · Finance · WorkFocus · HomeOS
───────────────────────────────────────────────────────────────

   Purpose
   • Define non-negotiable temporal invariants used across corAe.
   • Standardize cadences (28-day operational month), week refs,
     anchor semantics, and version discipline for time logic.

   Principles (150.logic)
   • Pure constants and pure functions only (no I/O, no imports).
   • Deterministic, side-effect free, testable in isolation.
   • Date handling: prefer date-only ISO (yyyy-mm-dd) for laws.
   • UI/Runtime layers may apply timezones; laws remain universal.

   Change Control
   • v1.0 — Enacted 2025-10-15 by Subject 1 (Founder).
   • Amending this law requires bumping SEMVER in `TimeLaw.version`
     and recording a new clause in `TimeLaw.changelog`.

─────────────────────────────────────────────────────────────── */

export type WeekRef = "W1" | "W2" | "W3" | "W4";

export type TimeLawChangelogItem = {
  version: string;
  enactedAtISO: string;       // ISO timestamp
  summary: string;
};

export const TimeLaw = {
  /** Semantic version of the temporal law. */
  version: "1.0.0",

  /** Canonical operational month (28-day cadence). */
  cadence: {
    /** Total days in the operational cycle. */
    daysPerCycle: 28 as const,

    /** Week demarcation within the cycle. */
    weeks: {
      W1: { startDay: 1, endDay: 7 },
      W2: { startDay: 8, endDay: 14 },
      W3: { startDay: 15, endDay: 21 },
      W4: { startDay: 22, endDay: 28 },
    } as const,

    /** Validate day-in-cycle (1..28). */
    isValidDayInCycle(day: number): boolean {
      return Number.isInteger(day) && day >= 1 && day <= 28;
    },

    /** Map a day-in-cycle (1..28) to week ref W1..W4. */
    weekRefFor(day: number): WeekRef {
      if (!this.isValidDayInCycle(day)) {
        throw new Error("TimeLaw: day must be 1..28");
      }
      if (day <= 7) return "W1";
      if (day <= 14) return "W2";
      if (day <= 21) return "W3";
      return "W4";
    },
  },

  /** Anchor rules for cycles. */
  anchor: {
    /**
     * An anchor is the first day of a 28-day cycle.
     * Must be expressed as date-only ISO (yyyy-mm-dd).
     */
    isValidAnchorISO(s: string): boolean {
      return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
    },

    /**
     * Normalizes a Date into date-only ISO (local wall clock).
     * (Law level does not apply TZ math; consumers may.)
     */
    toDateOnlyISO(d: Date): string {
      const z = new Date(d);
      z.setHours(0, 0, 0, 0);
      const y = z.getFullYear();
      const m = String(z.getMonth() + 1).padStart(2, "0");
      const day = String(z.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },
  },

  /** Stable identifiers for cycle windows. */
  identity: {
    /**
     * Compute a stable cycleId given an anchor and a 0-based cycle sequence.
     * Example: "20251001-0" for first cycle starting 2025-10-01.
     */
    cycleId(anchorISO: string, cycleSeq: number): string {
      if (!TimeLaw.anchor.isValidAnchorISO(anchorISO)) {
        throw new Error("TimeLaw: invalid anchorISO (yyyy-mm-dd required)");
      }
      if (!Number.isInteger(cycleSeq) || cycleSeq < 0) {
        throw new Error("TimeLaw: cycleSeq must be an integer ≥ 0");
      }
      return anchorISO.replace(/-/g, "") + "-" + String(cycleSeq);
    },
  },

  /** Guardrails for consumers (UI/API/Libs). */
  guards: {
    /**
     * Ensure a provided anchor/date pair adheres to law.
     * Throws with descriptive messages on violation.
     */
    assertAnchor(anchorISO: string) {
      if (!TimeLaw.anchor.isValidAnchorISO(anchorISO)) {
        throw new Error(
          "TimeLaw: anchorISO must be date-only ISO (yyyy-mm-dd), e.g., 2025-10-01"
        );
      }
    },

    assertDayInCycle(day: number) {
      if (!TimeLaw.cadence.isValidDayInCycle(day)) {
        throw new Error("TimeLaw: dayInCycle must be in range 1..28");
      }
    },
  },

  /** Record of enacted versions. */
  changelog: [
    {
      version: "1.0.0",
      enactedAtISO: "2025-10-15T00:00:00.000Z",
      summary:
        "Established 28-day operational cadence, week references (W1–W4), anchor semantics, cycle identity, and validation guards.",
    },
  ] as TimeLawChangelogItem[],
} as const;