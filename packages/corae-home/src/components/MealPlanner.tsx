"use client";
/* ──────────────────────────────────────────────────────────────
   corAe Home — Meal Planner Tile
   7-day planner with local persistence and gentle editing.
────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from "react";
import { getLocal, setLocal, clearLocal } from "../lib/storage";
import { getTodayName } from "../lib/date";
import type { TileProps } from "../types";
import type { DailyMealPlan, MealType, MealItem } from "../data/mealPlan";
import { mealPlan as SEED_PLAN } from "../data/mealPlan";

const STORAGE_KEY = "corae.home.mealplan.v1";

type PlannerProps = TileProps<DailyMealPlan[]> & {
  seed?: DailyMealPlan[]; // optional override
};

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export function MealPlanner({ title, seed }: PlannerProps) {
  // Load from storage or fall back to seed
  const [plan, setPlan] = useState<DailyMealPlan[]>(
    getLocal<DailyMealPlan[]>(STORAGE_KEY, seed ?? SEED_PLAN)
  );

  // selected day = today by default
  const [dayIndex, setDayIndex] = useState<number>(() => {
    const t = getTodayName();
    const idx = plan.findIndex((d) => d.day.toLowerCase() === t.toLowerCase());
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    setLocal(STORAGE_KEY, plan);
  }, [plan]);

  const day = plan[dayIndex];

  const headerTitle = title || "Meal Planner";

  const dayNames = useMemo(() => plan.map((d) => d.day), [plan]);

  function cycle(delta: number) {
    setDayIndex((i) => (i + delta + plan.length) % plan.length);
  }

  function setToday() {
    const t = getTodayName();
    const idx = plan.findIndex((d) => d.day.toLowerCase() === t.toLowerCase());
    if (idx >= 0) setDayIndex(idx);
  }

  function updateMeal(type: MealType, patch: Partial<MealItem>) {
    setPlan((prev) => {
      const next = [...prev];
      const current = { ...next[dayIndex] };
      current.meals = {
        ...current.meals,
        [type]: { ...current.meals[type], ...patch },
      };
      next[dayIndex] = current;
      return next;
    });
  }

  function resetAll() {
    clearLocal(STORAGE_KEY);
    setPlan(seed ?? SEED_PLAN);
    setToday();
  }

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-medium">{headerTitle}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => cycle(-1)}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50"
            aria-label="Previous day"
          >
            ◀
          </button>
          <select
            value={dayIndex}
            onChange={(e) => setDayIndex(parseInt(e.target.value))}
            className="rounded-lg border px-2 py-1 text-sm"
            aria-label="Select day"
          >
            {dayNames.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={() => cycle(1)}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50"
            aria-label="Next day"
          >
            ▶
          </button>
          <button
            onClick={setToday}
            className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50"
            title="Jump to today"
          >
            Today
          </button>
          <button
            onClick={resetAll}
            className="rounded-lg border px-2 py-1 text-sm text-blue-700 hover:bg-blue-50"
            title="Restore defaults"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Meals list */}
      <section className="grid gap-3">
        {MEAL_TYPES.map((mt) => {
          const item = day.meals[mt];
          return (
            <article
              key={mt}
              className="rounded-xl border p-3 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold capitalize">{mt}</h3>
                <small className="text-xs text-neutral-500">
                  {item?.ingredients?.length
                    ? `${item.ingredients.length} ingredients`
                    : ""}
                </small>
              </div>

              <div className="mt-2 flex flex-col gap-2">
                <input
                  value={item?.name || ""}
                  onChange={(e) => updateMeal(mt, { name: e.target.value })}
                  placeholder="Meal name…"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <input
                  value={item?.notes || ""}
                  onChange={(e) => updateMeal(mt, { notes: e.target.value })}
                  placeholder="Notes (prep, leftovers, etc.)"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
                <IngredientsEditor
                  mealType={mt}
                  value={item?.ingredients || []}
                  onChange={(ing) => updateMeal(mt, { ingredients: ing })}
                />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Ingredients Editor (inline, minimal)
────────────────────────────────────────────────────────────── */
function IngredientsEditor({
  value,
  onChange,
  mealType,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  mealType: MealType;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...value, v]);
    setDraft("");
  }

  function remove(idx: number) {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div className="rounded-lg border p-2">
      <label className="text-xs text-neutral-600">
        Ingredients for <span className="capitalize">{mealType}</span>
      </label>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add ingredient…"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <button
          onClick={add}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((ing, idx) => (
            <li
              key={`${ing}-${idx}`}
              className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
            >
              <span>{ing}</span>
              <button
                onClick={() => remove(idx)}
                className="text-neutral-500 hover:text-red-600"
                title="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MealPlanner;