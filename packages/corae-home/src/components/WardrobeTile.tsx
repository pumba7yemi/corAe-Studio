"use client";
/* ──────────────────────────────────────────────────────────────
   corAe Home — Wardrobe Tile
   Daily outfit suggestion + last-worn tracking (local persistence)
────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from "react";
import { getLocal, setLocal } from "../lib/storage";
import { formatShortDate, getTodayName, isSameDay } from "../lib/date";
import type { TileProps } from "../types";
import type { WardrobeItem } from "../data/wardrobeData";
import { wardrobeItems as SEED_ITEMS, getWardrobeForDay } from "../data/wardrobeData";

type WardrobeTileState = {
  items: WardrobeItem[];
  lastUpdated?: string; // ISO
};

const STORAGE_KEY = "corae.home.wardrobe.v1";

export function WardrobeTile({ title }: TileProps<WardrobeTileState>) {
  const [state, setState] = useState<WardrobeTileState>(
    getLocal<WardrobeTileState>(STORAGE_KEY, {
      items: SEED_ITEMS,
      lastUpdated: undefined,
    })
  );

  // Today’s recommended outfit (from rotation seed)
  const today = getTodayName();
  const recommended = useMemo<WardrobeItem[]>(() => {
    const ids = getWardrobeForDay(today).map((i) => i.id);
    return ids
      .map((id) => state.items.find((it) => it.id === id))
      .filter(Boolean) as WardrobeItem[];
  }, [state.items, today]);

  // Persist on change
  useEffect(() => {
    setLocal(STORAGE_KEY, state);
  }, [state]);

  function markWorn(id: string) {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, lastWorn: now } : it)),
      lastUpdated: now,
    }));
  }

  function toggleWashable(id: string) {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === id ? { ...it, washable: !it.washable } : it
      ),
    }));
  }

  const headerTitle = title || "Wardrobe";

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-3">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{headerTitle}</h2>
        {state.lastUpdated && (
          <span className="text-xs text-neutral-500">
            Updated {formatShortDate(state.lastUpdated)}
          </span>
        )}
      </header>

      <p className="text-sm text-neutral-600">
        Recommended for <span className="font-medium">{today}</span>
      </p>

      <ul className="space-y-2">
        {recommended.map((item) => {
          const wornToday =
            item.lastWorn && isSameDay(item.lastWorn, new Date().toISOString());

          return (
            <li
              key={item.id}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {item.name}
                  {item.color ? (
                    <span className="text-neutral-500 font-normal"> • {item.color}</span>
                  ) : null}
                </p>
                <p className="text-xs text-neutral-500">
                  {item.category}
                  {item.lastWorn
                    ? ` • last worn ${formatShortDate(item.lastWorn)}`
                    : " • not tracked yet"}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleWashable(item.id)}
                  className={`rounded-lg border px-2 py-1 text-xs ${
                    item.washable
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-neutral-300 hover:bg-neutral-50"
                  }`}
                  title={item.washable ? "Washable" : "Mark as washable"}
                >
                  {item.washable ? "Washable" : "Mark Washable"}
                </button>
                <button
                  onClick={() => markWorn(item.id)}
                  className={`rounded-lg px-3 py-2 text-xs ${
                    wornToday
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  title={wornToday ? "Already marked for today" : "Mark as worn today"}
                >
                  {wornToday ? "Worn ✓" : "Mark Worn"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default WardrobeTile;