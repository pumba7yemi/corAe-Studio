"use client";
/* ──────────────────────────────────────────────────────────────
   corAe Home — Fitness Tile
   Minimal session tracker: type, minutes, notes. Local persistence.
────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from "react";
import { getLocal, setLocal, clearLocal } from "../lib/storage";
import { formatShortDate } from "../lib/date";
import type { TileProps } from "../types";

type SessionType =
  | "Walk"
  | "Run"
  | "Cycle"
  | "Swim"
  | "Gym"
  | "Yoga"
  | "Stretch"
  | "Other";

export interface FitnessSession {
  id: string;
  date: string; // ISO
  type: SessionType;
  minutes: number;
  notes?: string;
}

type FitnessState = {
  sessions: FitnessSession[];
  lastUpdated?: string; // ISO
};

const STORAGE_KEY = "corae.home.fitness.v1";

const TYPES: SessionType[] = [
  "Walk",
  "Run",
  "Cycle",
  "Swim",
  "Gym",
  "Yoga",
  "Stretch",
  "Other",
];

export function FitnessTile({ title }: TileProps<FitnessState>) {
  const [state, setState] = useState<FitnessState>(
    getLocal<FitnessState>(STORAGE_KEY, { sessions: [] })
  );
  const [draftType, setDraftType] = useState<SessionType>("Walk");
  const [draftMin, setDraftMin] = useState<number>(20);
  const [draftNotes, setDraftNotes] = useState<string>("");

  useEffect(() => {
    setLocal(STORAGE_KEY, state);
  }, [state]);

  const headerTitle = title || "Fitness";

  const totalMinutesThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime());
    weekAgo.setDate(now.getDate() - 7);
    return state.sessions
      .filter((s) => new Date(s.date) >= weekAgo)
      .reduce((sum, s) => sum + (s.minutes || 0), 0);
  }, [state.sessions]);

  function addSession() {
    if (!draftMin || draftMin < 1) return;
    const nowISO = new Date().toISOString();
    const newEntry: FitnessSession = {
      id: Math.random().toString(36).slice(2),
      date: nowISO,
      type: draftType,
      minutes: Math.round(draftMin),
      notes: draftNotes.trim() || undefined,
    };
    setState((prev) => ({
      sessions: [newEntry, ...prev.sessions].slice(0, 100), // cap history
      lastUpdated: nowISO,
    }));
    setDraftNotes("");
  }

  function deleteSession(id: string) {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }

  function resetAll() {
    clearLocal(STORAGE_KEY);
    setState({ sessions: [] });
  }

  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{headerTitle}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            Weekly total: <strong>{totalMinutesThisWeek}</strong> min
          </span>
          <button
            onClick={resetAll}
            className="text-xs text-blue-700 underline hover:text-blue-900"
            title="Clear fitness history on this device"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Quick add */}
      <section className="rounded-xl border p-3 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={draftType}
            onChange={(e) => setDraftType(e.target.value as SessionType)}
            className="rounded-lg border px-2 py-2 text-sm"
            aria-label="Session type"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="text-sm text-neutral-600">
            Minutes
            <input
              type="number"
              min={1}
              max={600}
              value={draftMin}
              onChange={(e) => setDraftMin(Number(e.target.value))}
              className="ml-2 w-20 rounded-lg border px-2 py-1 text-sm"
            />
          </label>
        </div>

        <input
          value={draftNotes}
          onChange={(e) => setDraftNotes(e.target.value)}
          placeholder="Notes (optional)…"
          className="w-full rounded-lg border px-3 py-2 text-sm"
        />

        <button
          onClick={addSession}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          aria-label="Add fitness session"
        >
          Add Session
        </button>
      </section>

      {/* History */}
      {state.sessions.length > 0 ? (
        <ul className="space-y-2">
          {state.sessions.slice(0, 8).map((s) => (
            <li
              key={s.id}
              className="rounded-xl border p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {s.type} • {s.minutes} min
                </p>
                <p className="text-xs text-neutral-500">
                  {formatShortDate(s.date)}
                  {s.notes ? ` • ${s.notes}` : ""}
                </p>
              </div>
              <button
                onClick={() => deleteSession(s.id)}
                className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50"
                title="Delete session"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-600">
          No sessions yet. Start with a 10–20 minute walk.
        </p>
      )}
    </div>
  );
}

export default FitnessTile;