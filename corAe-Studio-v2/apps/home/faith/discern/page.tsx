"use client";

/* ──────────────────────────────────────────────────────────────
   corAe — Ship/Home/Faith/Discern
   Peace → Perspective → Practice flow with local-only logs.
   No external deps. Safe for Next.js App Router.
────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef, useState } from "react";

/* ──────────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────────── */
type Category = "spiritual" | "emotional" | "practical" | "unclear";
type Step = 1 | 2 | 3 | 4;

type LogEntry = {
  ts: number;
  input: string;
  category: Category;
  peaceLevel: number;
  action: string;
};

/* ──────────────────────────────────────────────────────────────
   Seed content: verses, insights, actions (offline-first)
────────────────────────────────────────────────────────────── */
const VERSES: Record<Category, { ref: string; text: string }> = {
  spiritual: {
    ref: "Ephesians 6:10–11",
    text: "Be strong in the Lord and in the strength of his might. Put on the whole armor of God.",
  },
  emotional: {
    ref: "Philippians 4:6–7",
    text:
      "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God...",
  },
  practical: {
    ref: "James 1:5",
    text:
      "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.",
  },
  unclear: {
    ref: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
};

const INSIGHTS: Record<Category, string> = {
  spiritual:
    "Some pressures do have a spiritual edge. Respond with calm authority: prayer, Scripture, and accountability. Avoid sensationalizing; peace is your proof.",
  emotional:
    "High stress, exhaustion, or trauma can make reactions feel ‘bigger than reality’. First lower the body’s alarm, then speak kindly and simply.",
  practical:
    "Sometimes it’s just timing, logistics, or a solvable problem. Plan one small, sensible step. Wisdom is worship when done in peace.",
  unclear:
    "When causes are tangled, choose stillness over analysis. If peace rises during prayer and rest, your next step will appear.",
};

const NEXT_STEPS: Record<Category, string[]> = {
  spiritual: [
    "Pray Psalm 91 aloud tonight",
    "Message a trusted mentor to check in",
    "Remove triggering media for 48h; play worship softly",
  ],
  emotional: [
    "10-minute walk without phone",
    "Write one kind sentence to the person involved",
    "Hydrate, eat, and sleep at a steady time tonight",
  ],
  practical: [
    "Schedule a 15-min call to clarify facts",
    "List 3 options and pick the smallest next step",
    "Set a 25-min focus timer to begin",
  ],
  unclear: [
    "2 minutes of quiet breathing",
    "Write one line of gratitude",
    "Revisit this question tomorrow after rest",
  ],
};

/* ──────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────── */
function cls(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function saveLog(entry: LogEntry) {
  try {
    const key = "corae.faith.discern.logs";
    const raw = localStorage.getItem(key);
    const arr: LogEntry[] = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    localStorage.setItem(key, JSON.stringify(arr.slice(0, 50)));
  } catch {}
}

function loadHint(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("corae.faith.discern.draft") || "";
}

/* ──────────────────────────────────────────────────────────────
   Breath timer (simple 4–6 cycle)
────────────────────────────────────────────────────────────── */
function useBreathTimer(active: boolean) {
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");
  const [count, setCount] = useState(4);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setPhase("inhale");
      setCount(4);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        // switch phase
        setPhase((p) => (p === "inhale" ? "exhale" : "inhale"));
        // when we just switched, the *next* phase length applies
        return phase === "inhale" ? 6 : 4;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return { phase, count };
}

/* ──────────────────────────────────────────────────────────────
   Category inference (very light, on-device)
────────────────────────────────────────────────────────────── */
function inferCategory(text: string): Category {
  const t = text.toLowerCase();
  const hasDemon = /(demon|evil|curse|attack|dark|satan)/.test(t);
  const hasAnx = /(anxious|panic|fear|worry|overwhelmed|terrified)/.test(t);
  const hasLog = /(bill|invoice|deadline|meeting|rent|visa|work|money|plan)/.test(t);
  if (hasDemon && !hasLog) return "spiritual";
  if (hasLog && !hasDemon) return "practical";
  if (hasAnx && !hasDemon && !hasLog) return "emotional";
  return "unclear";
}

/* ──────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────── */
export default function DiscernPage() {
  const [step, setStep] = useState<Step>(1);
  const [input, setInput] = useState<string>(loadHint());
  const [category, setCategory] = useState<Category>("unclear");
  const [peace, setPeace] = useState<number>(3);
  const [pickedAction, setPickedAction] = useState<string>("");

  useEffect(() => {
    sessionStorage.setItem("corae.faith.discern.draft", input);
  }, [input]);

  const verse = useMemo(() => VERSES[category], [category]);
  const insight = useMemo(() => INSIGHTS[category], [category]);
  const actions = useMemo(() => NEXT_STEPS[category], [category]);

  const [breathOn, setBreathOn] = useState(false);
  const { phase, count } = useBreathTimer(step === 3 && breathOn);

  function next() {
    if (step === 1) {
      const cat = inferCategory(input);
      setCategory(cat);
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      setBreathOn(true);
      return;
    }
    if (step === 3) {
      setBreathOn(false);
      setStep(4);
      return;
    }
    if (step === 4) {
      saveLog({
        ts: Date.now(),
        input: input.trim().slice(0, 500),
        category,
        peaceLevel: peace,
        action: pickedAction || actions[0] || "—",
      });
      setPickedAction("");
      setPeace(5);
      setStep(1);
      return;
    }
  }

  function back() {
    if (step === 1) return;
    if (step === 3) setBreathOn(false);
    setStep(((step - 1) as Step) || 1);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Discernment</h1>
          <p className="text-sm text-neutral-500">
            Peace → Perspective → Practice. One clear next step.
          </p>
        </div>
        <a
          href="/ship/faith"
          className="text-sm underline text-neutral-600 hover:text-neutral-800"
        >
          Faith Hub
        </a>
      </header>

      {/* Progress */}
      <ol className="grid grid-cols-4 gap-2">
        {["Acknowledge", "Discern", "Ground", "Act"].map((label, i) => {
          const active = step === (i + 1);
          const done = step > (i + 1);
          return (
            <li
              key={label}
              className={cls(
                "rounded-xl border px-2 py-2 text-center text-xs",
                active && "border-blue-600 bg-blue-50",
                done && "border-green-600 bg-green-50",
                !active && !done && "border-neutral-200"
              )}
            >
              {label}
            </li>
          );
        })}
      </ol>

      {/* Step 1 — Acknowledge */}
      {step === 1 && (
        <section className="space-y-4 rounded-2xl border p-4">
          <h2 className="text-lg font-medium">What’s troubling you?</h2>
          <p className="text-sm text-neutral-600">
            Use simple words. You’re heard. We’ll find calm first.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="e.g., We argued again and I felt a dark pressure…"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Tip: You can also use the mic on your phone to dictate.
            </span>
            <button
              onClick={next}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              disabled={!input.trim()}
            >
              Continue
            </button>
          </div>
        </section>
      )}

      {/* Step 2 — Discern */}
      {step === 2 && (
        <section className="space-y-4 rounded-2xl border p-4">
          <h2 className="text-lg font-medium">Perspective</h2>
          <p className="text-sm text-neutral-600">
            Here’s a balanced view. You can adjust it if needed.
          </p>

          <div className="rounded-xl border bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Suggested Lens
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {(["spiritual", "emotional", "practical", "unclear"] as Category[]).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={cls(
                      "rounded-lg border px-3 py-1 text-sm capitalize",
                      category === c
                        ? "border-blue-600 bg-blue-50"
                        : "border-neutral-200 hover:bg-neutral-100"
                    )}
                  >
                    {c}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-sm">{insight}</p>
            <div className="mt-3 rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Scripture</p>
              <p className="text-sm font-medium">{verse.ref}</p>
              <p className="text-sm text-neutral-700 mt-1">{verse.text}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={back}
              className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
            >
              Back
            </button>
            <button
              onClick={next}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Ground me
            </button>
          </div>
        </section>
      )}

      {/* Step 3 — Ground (breath + peace meter) */}
      {step === 3 && (
        <section className="space-y-4 rounded-2xl border p-4">
          <h2 className="text-lg font-medium">Grounding</h2>
          <p className="text-sm text-neutral-600">Slow breath, then check your peace.</p>

          <div className="rounded-xl border p-3 text-center">
            <p className="text-sm">
              <span className="font-medium">
                {breathOn ? (phase === "inhale" ? "Inhale" : "Exhale") : "Ready?"}
              </span>{" "}
              {breathOn && <span>• {count}s</span>}
            </p>
            <button
              onClick={() => setBreathOn((v) => !v)}
              className={cls(
                "mt-2 rounded-xl px-4 py-2",
                breathOn
                  ? "bg-neutral-200 hover:bg-neutral-300"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {breathOn ? "Pause" : "Start 4–6 Breathing"}
            </button>
          </div>

          <div className="rounded-xl border p-3">
            <label className="text-sm font-medium">Peace level</label>
            <input
              type="range"
              min={0}
              max={10}
              value={peace}
              onChange={(e) => setPeace(parseInt(e.target.value))}
              className="mt-2 w-full"
            />
            <p className="text-sm text-neutral-600">
              {peace <= 3
                ? "Pressure is high — go gently."
                : peace <= 7
                ? "Peace is rising."
                : "Peaceful. You’re ready for a next step."}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={back}
              className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
            >
              Back
            </button>
            <button
              onClick={next}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Choose an action
            </button>
          </div>
        </section>
      )}

      {/* Step 4 — Act (single next step) */}
      {step === 4 && (
        <section className="space-y-4 rounded-2xl border p-4">
          <h2 className="text-lg font-medium">Next Right Step</h2>
          <p className="text-sm text-neutral-600">
            Pick one. Keep it small and doable within 10–15 minutes.
          </p>

          <div className="grid gap-2">
            {actions.map((a) => (
              <button
                key={a}
                onClick={() => setPickedAction(a)}
                className={cls(
                  "rounded-xl border px-3 py-3 text-left text-sm",
                  pickedAction === a
                    ? "border-green-600 bg-green-50"
                    : "border-neutral-200 hover:bg-neutral-50"
                )}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-xs text-neutral-500">Optional share</p>
            <p className="text-sm">
              You can tell a trusted contact:{" "}
              <span className="italic">
                “I’m choosing: {pickedAction || actions[0]} — please check on me in 30
                minutes.”
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="/ship/faith/ask"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                title="Ask Me CAIA"
              >
                Ask CAIA about this
              </a>
              <a
                href="/ship/faith"
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
              >
                Back to Faith Hub
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={back}
              className="rounded-xl border px-4 py-2 hover:bg-neutral-50"
            >
              Back
            </button>
            <button
              onClick={next}
              className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              disabled={!pickedAction}
              title={pickedAction ? "" : "Choose one action first"}
            >
              Confirm & Save
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Note: Logs are saved locally on this device (up to 50 entries).
          </p>
        </section>
      )}

      {/* Mini history (local) */}
      <History />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Local history component (read only)
────────────────────────────────────────────────────────────── */
function History() {
  const [items, setItems] = useState<LogEntry[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("corae.faith.discern.logs");
      setItems(raw ? JSON.parse(raw) : []);
    } catch {}
  }, []);
  if (!items.length) return null;
  return (
    <details className="rounded-2xl border p-4">
      <summary className="cursor-pointer text-sm font-medium">
        Recent Discernments (local)
      </summary>
      <ul className="mt-3 space-y-2">
        {items.slice(0, 5).map((it, idx) => (
          <li key={idx} className="rounded-xl border p-3">
            <p className="text-xs text-neutral-500">
              {new Date(it.ts).toLocaleString()} • {it.category} • peace {it.peaceLevel}/10
            </p>
            <p className="mt-1 text-sm line-clamp-3">{it.input}</p>
            <p className="mt-1 text-xs text-neutral-600">
              Action: <span className="italic">{it.action}</span>
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
