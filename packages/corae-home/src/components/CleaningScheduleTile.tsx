"use client";
/* ──────────────────────────────────────────────────────────────
   corAe Home — Cleaning Schedule Tile
   Simple offline cleaning tracker with local persistence.
────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { getLocal, setLocal } from "../lib/storage";
import type { SimpleListItem, TileProps } from "../types";

const STORAGE_KEY = "corae.home.cleaning.schedule";

const DEFAULT_TASKS: SimpleListItem[] = [
  { id: "floors", label: "Sweep & mop floors" },
  { id: "kitchen", label: "Clean kitchen surfaces" },
  { id: "bathroom", label: "Sanitise bathroom" },
  { id: "dust", label: "Dust furniture & shelves" },
  { id: "bins", label: "Empty bins" },
];

export function CleaningScheduleTile({ id, title }: TileProps) {
  const [tasks, setTasks] = useState<SimpleListItem[]>(
    getLocal<SimpleListItem[]>(STORAGE_KEY, DEFAULT_TASKS)
  );

  useEffect(() => {
    setLocal(STORAGE_KEY, tasks);
  }, [tasks]);

  function toggle(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function reset() {
    setTasks(DEFAULT_TASKS.map((t) => ({ ...t, done: false })));
  }

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title || "Cleaning"}</h2>
        <button
          onClick={reset}
          className="text-xs text-blue-600 underline hover:text-blue-800"
        >
          Reset
        </button>
      </header>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm cursor-pointer ${
              t.done
                ? "bg-green-50 border-green-300 line-through text-neutral-500"
                : "hover:bg-neutral-50 border-neutral-200"
            }`}
          >
            <span>{t.label}</span>
            {t.done && <span className="text-green-600 text-xs">✓</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CleaningScheduleTile;