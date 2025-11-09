"use client";
/* ──────────────────────────────────────────────────────────────
   corAe Home — What I Want Tile
   A gentle intention board: capture 1–3 meaningful desires,
   prioritize them, and carry one forward each day.
   Local-only persistence.
────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from "react";
import { getLocal, setLocal, clearLocal } from "../lib/storage";
import { formatShortDate } from "../lib/date";
import type { TileProps } from "../types";

type Priority = 1 | 2 | 3; // 1 = high
export interface Desire {
  id: string;
  text: string;
  priority: Priority;
  createdAt: string; // ISO
  doneAt?: string;   // ISO
  note?: string;
}

type State = {
  items: Desire[];
  lastUpdated?: string;
};

const STORAGE_KEY = "corae.home.want.v1";

export function WhatIWantTile({ title }: TileProps<State>) {
  const [state, setState] = useState<State>(
    getLocal<State>(STORAGE_KEY, { items: [] })
  );

  const [draftText, setDraftText] = useState("");
  const [draftPri, setDraftPri] = useState<Priority>(1);

  useEffect(() => {
    setLocal(STORAGE_KEY, state);
  }, [state]);

  const headerTitle = title || "What I Want";

  const active = useMemo(
    () => state.items.filter((i) => !i.doneAt),
    [state.items]
  );
  const completed = useMemo(
    () => state.items.filter((i) => i.doneAt),
    [state.items]
  );

  function add() {
    const t = draftText.trim();
    if (!t) return;
    const now = new Date().toISOString();
    const entry: Desire = {
      id: Math.random().toString(36).slice(2),
      text: t,
      priority: draftPri,
      createdAt: now,
    };
    setState((prev) => ({
      items: [entry, ...prev.items].slice(0, 50),
      lastUpdated: now,
    }));
    setDraftText("");
    setDraftPri(1);
  }

  function toggleDone(id: string) {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, doneAt: i.doneAt ? undefined : now } : i
      ),
      lastUpdated: now,
    }));
  }

  function reprioritise(id: string, dir: "up" | "down") {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        if (i.id !== id) return i;
        const delta = dir === "up" ? -1 : 1;
        let next = (i.priority + delta) as Priority;
        if (next < 1) next = 1 as Priority;
        if (next > 3) next = 3 as Priority;
        return { ...i, priority: next };
      }),
      lastUpdated: new Date().toISOString(),
    }));
  }

  function remove(id: string) {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }

  function resetAll() {
    clearLocal(STORAGE_KEY);
    setState({ items: [] });
  }

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{headerTitle}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            {state.lastUpdated ? `Updated ${formatShortDate(state.lastUpdated)}` : ""}
          </span>
          <button
            onClick={resetAll}
            className="text-xs text-blue-700 underline hover:text-blue-900"
            title="Clear local intentions"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Quick add */}
      <section className="rounded-xl border p-3 space-y-3">
        <label className="text-sm text-neutral-600">
          I want to…
          <input
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="e.g., call my mother; learn to cook biryani; save X…"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600">Priority</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setDraftPri(p as Priority)}
                className={`rounded-lg border px-2 py-1 text-sm ${
                  draftPri === p
                    ? "bg-amber-100 border-amber-400"
                    : "border-neutral-300 hover:bg-neutral-50"
                }`}
                title={`Priority ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={add}
            className="ml-auto rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </section>

      {/* Active list */}
      <section>
        <h3 className="text-sm font-semibold">Active</h3>
        {active.length ? (
          <ul className="mt-2 space-y-2">
            {active
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 7)
              .map((i) => (
                <li
                  key={i.id}
                  className="rounded-xl border p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{i.text}</p>
                    <p className="text-xs text-neutral-500">
                      Priority {i.priority} • since {formatShortDate(i.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => reprioritise(i.id, "up")}
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                      title="Higher priority"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => reprioritise(i.id, "down")}
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                      title="Lower priority"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => toggleDone(i.id)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700"
                      title="Mark as done"
                    >
                      Done
                    </button>
                    <button
                      onClick={() => remove(i.id)}
                      className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                      title="Remove"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-600">Nothing yet. Add 1–3 true desires.</p>
        )}
      </section>

      {/* Completed (collapsed) */}
      {completed.length > 0 && (
        <details className="rounded-xl border p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            Completed ({completed.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {completed.slice(0, 10).map((i) => (
              <li
                key={i.id}
                className="rounded-lg border p-2 text-sm flex items-center justify-between"
              >
                <div className="min-w-0">
                  <span className="line-through text-neutral-500">{i.text}</span>
                  <span className="text-xs text-neutral-400">
                    {" "}
                    • done {i.doneAt ? formatShortDate(i.doneAt) : ""}
                  </span>
                </div>
                <button
                  onClick={() => toggleDone(i.id)}
                  className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                  title="Mark active again"
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export default WhatIWantTile;