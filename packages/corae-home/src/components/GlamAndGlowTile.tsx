"use client";
/* ──────────────────────────────────────────────────────────────
   corAe Home — Glam & Glow Tile
   Personal-care / appointment tracker (local-only)
────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { getLocal, setLocal, clearLocal } from "../lib/storage";
import { formatShortDate } from "../lib/date";
import type { TileProps } from "../types";

interface CareItem {
  id: string;
  label: string;
  nextDue?: string; // ISO
  note?: string;
}

const STORAGE_KEY = "corae.home.glam.v1";

const DEFAULT_ITEMS: CareItem[] = [
  { id: "haircut", label: "Haircut" },
  { id: "nails", label: "Nails / Manicure" },
  { id: "facial", label: "Facial Treatment" },
  { id: "massage", label: "Massage / Relaxation" },
];

export function GlamAndGlowTile({ title }: TileProps<CareItem[]>) {
  const [items, setItems] = useState<CareItem[]>(
    getLocal<CareItem[]>(STORAGE_KEY, DEFAULT_ITEMS)
  );

  useEffect(() => {
    setLocal(STORAGE_KEY, items);
  }, [items]);

  const headerTitle = title || "Glam & Glow";

  function markDone(id: string) {
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, nextDue: calcNextDue(now) } : i))
    );
  }

  function reset() {
    clearLocal(STORAGE_KEY);
    setItems(DEFAULT_ITEMS);
  }

  function calcNextDue(fromISO: string): string {
    const d = new Date(fromISO);
    d.setDate(d.getDate() + 30); // monthly default
    return d.toISOString();
  }

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{headerTitle}</h2>
        <button
          onClick={reset}
          className="text-xs text-blue-700 underline hover:text-blue-900"
        >
          Reset
        </button>
      </header>

      <ul className="space-y-2">
        {items.map((i) => {
          const due = i.nextDue ? formatShortDate(i.nextDue) : "—";
          return (
            <li
              key={i.id}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-medium">{i.label}</p>
                <p className="text-xs text-neutral-500">
                  Next due: {due}
                </p>
              </div>
              <button
                onClick={() => markDone(i.id)}
                className="rounded-lg bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700"
              >
                Done
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default GlamAndGlowTile;