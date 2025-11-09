"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * CAIAHost — a lightweight, friendly companion panel.
 * FIX: Avoid hydration mismatch by not reading localStorage in initial render.
 */

type Slide = { title: string; body: string };

const STORAGE_KEYS = {
  hidden: "caia:hidden",
  step: "caia:step"
} as const;

const DEFAULT_SLIDES: Slide[] = [
  { title: "Welcome",    body: "I’m your companion in flow. I keep things simple and help you move with clarity." },
  { title: "Simplicity", body: "Everything is broken into easy steps. No noise. No overwhelm. Just progress." },
  { title: "Continuity", body: "Move from home to work to business without switching context. I carry the thread." },
  { title: "Care",       body: "I adapt to your role and remember what matters. You are seen, not just signed in." },
  { title: "Let’s begin",body: "You’re ready. I’m here whenever you need a nudge or a next step." }
];

export type CAIAHostProps = {
  slides?: Slide[];
  className?: string;
};

export default function CAIAHost({ slides, className }: CAIAHostProps) {
  const pages = useMemo(() => slides ?? DEFAULT_SLIDES, [slides]);

  // 🧱 Stable SSR defaults — DO NOT read localStorage here.
  const [hidden, setHidden] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);

  // ✅ After mount, sync from localStorage (safe, no hydration mismatch).
  useEffect(() => {
    try {
      const h = window.localStorage.getItem(STORAGE_KEYS.hidden);
      if (h === "1") setHidden(true);
      const raw = window.localStorage.getItem(STORAGE_KEYS.step);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n)) {
          const clamped = Math.min(Math.max(n, 0), pages.length - 1);
          if (clamped !== step) setStep(clamped);
        }
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]); // run once per slides length

  // Persist on change (post-mount)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.hidden, hidden ? "1" : "0");
      window.localStorage.setItem(STORAGE_KEYS.step, String(step));
    } catch {
      // ignore
    }
  }, [hidden, step]);

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-slate-50"
        aria-label="Open CAIA"
        title="Open CAIA"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
        Open CAIA
      </button>
    );
  }

  const last = step >= pages.length - 1;
  const s = pages[step];

  return (
    <section
      className={[
        "rounded-2xl border bg-white p-4 shadow-sm",
        "transition-all duration-200",
        className || ""
      ].join(" ")}
      aria-live="polite"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{s.title}</h2>
          <p className="mt-1 text-sm text-slate-700">{s.body}</p>
        </div>

        <button
          onClick={() => setHidden(true)}
          className="rounded-lg border px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          aria-label="Hide CAIA"
          title="Hide"
        >
          Hide
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
              className={[
                "h-2 w-2 rounded-full",
                i === step ? "bg-blue-600" : "bg-slate-300 hover:bg-slate-400"
              ].join(" ")}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-xl border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Back
            </button>
          )}
          <button
            onClick={() => (last ? setHidden(true) : setStep(step + 1))}
            className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            {last ? "Finish" : "Continue"}
          </button>
        </div>
      </div>
    </section>
  );
}