// apps/studio/app/dtd/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * corAe — Digital Task Diary (3³DTD style)
 * - Lanes at top (Important / Inbox / Ongoing)
 * - Title keeps 3³ together (no wrap)
 * - Export buttons:
 *    • Export template (GET /api/export/dtd)
 *    • Export current lanes (POST /api/export/dtd with tasks)
 * - Persists to localStorage
 */

type LaneKey = "important" | "inbox" | "ongoing";

type Task = {
  id: string;
  key: string;          // I-001 / X-### / O-###
  title: string;
  lane: LaneKey;
  note?: string;
  createdAt: string;    // ISO
};

type DtdState = {
  tasks: Task[];
  anchorISO: string;    // 28-day strip anchor
};

const LS_KEY = "corae.dtd.v1";

/** Lane colors:
 *  - Important: rose (unchanged)
 *  - Inbox:     green  ✅
 *  - Ongoing:   blue   ✅
 */
const LANE_META: Record<LaneKey, { label: string; prefix: string; color: string }> = {
  important: { label: "Important", prefix: "I", color: "from-rose-400 to-rose-600" },
  inbox:     { label: "Inbox",     prefix: "X", color: "from-emerald-400 to-emerald-600" },
  ongoing:   { label: "Ongoing",   prefix: "O", color: "from-blue-400 to-blue-600" },
};

const uid = (p = "t") => `${p}-${Math.random().toString(36).slice(2, 10)}`;

function loadState(): DtdState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as DtdState;
  } catch {}
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { tasks: [], anchorISO: start.toISOString() };
}

function saveState(s: DtdState) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

function nextKey(tasks: Task[], lane: LaneKey): string {
  const prefix = LANE_META[lane].prefix;
  const n =
    tasks
      .filter((t) => t.lane === lane && t.key.startsWith(prefix + "-"))
      .map((t) => Number(t.key.split("-")[1]))
      .filter((x) => Number.isFinite(x))
      .sort((a, b) => b - a)[0] ?? 0;
  const pad = String(n + 1).padStart(3, "0");
  return `${prefix}-${pad}`;
}

type StripCell = { iso: string; label: string; week: "W1" | "W2" | "W3" | "W4" };

function span28(anchorISO: string): StripCell[] {
  const anchor = new Date(anchorISO);
  const cells: StripCell[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(anchor.getTime() + i * 86400000);
    const day = d.getDate().toString().padStart(2, "0");
    const wk = i <= 6 ? "W1" : i <= 13 ? "W2" : i <= 20 ? "W3" : "W4";
    cells.push({
      iso: d.toISOString().slice(0, 10),
      label: `${d.toLocaleDateString(undefined, { weekday: "short" })} ${day}`,
      week: wk,
    });
  }
  return cells;
}

/* ---------- helpers: download ---------- */
async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DtdPage() {
  const [state, setState] = useState<DtdState>(() => loadState());
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<{ lane: LaneKey; text: string }>({ lane: "inbox", text: "" });

  useEffect(() => saveState(state), [state]);

  const strip = useMemo(() => span28(state.anchorISO), [state.anchorISO]);

  // dnd
  const dragId = useRef<string | null>(null);
  function onDragStart(e: React.DragEvent, id: string) {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }
  function onDropToLane(e: React.DragEvent, lane: LaneKey) {
    e.preventDefault();
    const id = dragId.current;
    dragId.current = null;
    if (!id) return;
    setState((prev) => {
      const idx = prev.tasks.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const t = prev.tasks[idx];
      if (t.lane === lane) return prev;
      const newKey = nextKey(prev.tasks, lane);
      const tasks = [...prev.tasks];
      tasks[idx] = { ...t, lane, key: newKey };
      return { ...prev, tasks };
    });
  }

  function addTask() {
    const title = draft.text.trim();
    if (!title) return;
    setState((prev) => {
      const t: Task = {
        id: uid("task"),
        key: nextKey(prev.tasks, draft.lane),
        title,
        lane: draft.lane,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, tasks: [t, ...prev.tasks] };
    });
    setDraft((d) => ({ ...d, text: "" }));
  }

  /* ---------- EXPORT: template ---------- */
  async function exportTemplate() {
    const res = await fetch("/api/export/dtd", { method: "GET" });
    if (!res.ok) return console.error("Export failed");
    const blob = await res.blob();
    await downloadBlob(blob, "corae-3cDTD.pdf");
  }

  /* ---------- EXPORT: current lanes ---------- */
  async function exportCurrent() {
    const laneNames: Record<LaneKey, string> = {
      important: "Important",
      inbox: "Inbox",
      ongoing: "Ongoing",
    };
    const lanes = (["important", "inbox", "ongoing"] as LaneKey[]).map((k) => ({
      name: laneNames[k],
      items: state.tasks
        .filter((t) => t.lane === k)
        .slice(0, 12)
        .map((t) => `${t.key}: ${t.title}`),
    }));
    const payload = {
      title: "3³\u00A0Digital Task Diary", // keep tight space
      subtitle: "28 Day (4 Week) Schedule • Important • Inbox • Ongoing",
      generatedAtISO: new Date().toISOString(),
      lanes,
      stripDays: 28,
    };
    const res = await fetch("/api/export/dtd", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return console.error("Export failed");
    const blob = await res.blob();
    await downloadBlob(blob, "corae-3cDTD-current.pdf");
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500">
            <span className="absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold whitespace-nowrap">
            <span className="text-emerald-400">3³</span>Digital Task Diary
          </h1>
        </div>

        {/* export controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportTemplate}
            className="text-xs px-3 py-2 rounded-md border border-slate-600 hover:bg-slate-800"
          >
            Export template PDF
          </button>
          <button
            onClick={exportCurrent}
            className="text-xs px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Export current lanes
          </button>
        </div>
      </header>

      {/* lanes at top */}
      <section className="grid md:grid-cols-3 gap-3">
        {(["important", "inbox", "ongoing"] as LaneKey[]).map((lane) => (
          <Lane
            key={lane}
            lane={lane}
            tasks={state.tasks.filter((t) => t.lane === lane)}
            onDrop={(e) => onDropToLane(e, lane)}
            onDragStart={onDragStart}
          />
        ))}
      </section>

      {/* composer directly under lanes */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
        <div className="text-sm font-medium mb-2">New Task</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            className="w-full sm:w-40 rounded-md border border-slate-600 bg-slate-800 px-2 py-2 text-sm"
            value={draft.lane}
            onChange={(e) => setDraft((d) => ({ ...d, lane: e.target.value as LaneKey }))}
          >
            <option value="important">Important</option>
            <option value="inbox">Inbox</option>
            <option value="ongoing">Ongoing</option>
          </select>
          <input
            className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm"
            placeholder="Task title…"
            value={draft.text}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button
            className="rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-sm"
            onClick={addTask}
          >
            Add
          </button>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Auto-numbering: <code>I-###</code> for Important, <code>X-###</code> for Inbox,{" "}
          <code>O-###</code> for Ongoing.
        </div>
      </section>

      {/* 28 Day (4 Week) Schedule BELOW composer */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm text-slate-300">28 Day (4 Week) Schedule</div>
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 rounded-md border border-slate-600 hover:bg-slate-800"
              onClick={() =>
                setState((p) => ({
                  ...p,
                  anchorISO: new Date(new Date(p.anchorISO).getTime() - 28 * 86400000).toISOString(),
                }))
              }
            >
              ◀ Prev
            </button>
            <button
              className="text-xs px-2 py-1 rounded-md border border-slate-600 hover:bg-slate-800"
              onClick={() => setState((p) => ({ ...p, anchorISO: new Date().toISOString() }))}
            >
              Today
            </button>
            <button
              className="text-xs px-2 py-1 rounded-md border border-slate-600 hover:bg-slate-800"
              onClick={() =>
                setState((p) => ({
                  ...p,
                  anchorISO: new Date(new Date(p.anchorISO).getTime() + 28 * 86400000).toISOString(),
                }))
              }
            >
              Next ▶
            </button>
            <button
              className="ml-2 text-xs px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => setExpanded(true)}
            >
              Expand
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px] grid grid-cols-28 gap-1 px-3 pb-3">
            {strip.map((c, i) => (
              <div
                key={c.iso}
                className="rounded-md border border-slate-700/60 bg-slate-800/60 p-2 text-[10px]"
                title={c.iso}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{c.label}</span>
                  <span className="text-[9px] px-1 rounded bg-slate-700">{c.week}</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-700 overflow-hidden">
                  <div className="h-2 bg-emerald-500" style={{ width: `${(i % 5) * 20}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* expand modal */}
      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
          <div className="w-full max-w-6xl max-h-[85vh] overflow-auto rounded-2xl border border-slate-700 bg-slate-900">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="text-sm font-semibold">28 Day (4 Week) Schedule — Expanded</div>
              <button
                className="text-xs px-2 py-1 rounded-md border border-slate-600 hover:bg-slate-800"
                onClick={() => setExpanded(false)}
              >
                Close
              </button>
            </div>
            <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {strip.map((c) => (
                <div key={c.iso} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{c.label}</div>
                    <span className="text-[10px] px-1 rounded bg-slate-700">{c.week}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Notes &amp; Pulse merge coming in next slice.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== lane ===== */
function Lane({
  lane,
  tasks,
  onDrop,
  onDragStart,
}: {
  lane: LaneKey;
  tasks: Task[];
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const meta = LANE_META[lane];
  return (
    <div
      className="rounded-2xl border border-slate-700 bg-slate-900/40 p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">{meta.label}</div>
        <div className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${meta.color} text-white`}>
          {meta.prefix}
        </div>
      </div>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.id}
            draggable
            onDragStart={(e) => onDragStart(e, t.id)}
            className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 cursor-grab active:cursor-grabbing"
            title={new Date(t.createdAt).toLocaleString()}
          >
            <div className="text-xs text-slate-400">{t.key}</div>
            <div className="text-sm text-slate-100">{t.title}</div>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-xs text-slate-500 italic">Drop tasks here…</li>}
      </ul>
    </div>
  );
}