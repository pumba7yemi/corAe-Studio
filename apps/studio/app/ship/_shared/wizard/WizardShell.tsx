/* eslint-disable */
"use client";

import React, { useEffect, useMemo, useState } from "react";

type Step = {
  key: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  View: (props: any) => JSX.Element;
  // optional: gate/ok display
  ok?: boolean | (() => boolean);
};

export type WizardShellProps = {
  title: string;
  steps: Step[];
  initialStepKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>;
  onComplete?: () => void;
};

export default function WizardShell({
  title,
  steps,
  initialStepKey,
  context = {},
  onComplete,
}: WizardShellProps) {
  const [active, setActive] = useState<string>(initialStepKey ?? steps[0]?.key);
  const current = useMemo(() => steps.find((s) => s.key === active) ?? steps[0], [steps, active]);

  useEffect(() => {
    if (!current && steps.length) setActive(steps[0].key);
  }, [current, steps]);

  const idx = Math.max(0, steps.findIndex((s) => s.key === current?.key));
  const isFirst = idx === 0;
  const isLast = idx === steps.length - 1;

  const next = () => (isLast ? onComplete?.() : setActive(steps[idx + 1].key));
  const prev = () => (!isFirst ? setActive(steps[idx - 1].key) : undefined);

  if (!current) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="text-sm opacity-70">{idx + 1} / {steps.length}</div>
      </div>

      <nav className="flex flex-wrap gap-2">
        {steps.map((s, i) => {
          const ok = typeof s.ok === "function" ? s.ok() : !!s.ok;
          const activeCls = s.key === active ? "ring-2 ring-indigo-500" : "border";
          return (
            <button
              key={s.key}
              className={`px-3 py-1 rounded-md text-sm ${activeCls} ${ok ? "bg-emerald-50" : "bg-gray-50"}`}
              onClick={() => setActive(s.key)}
            >
              {i + 1}. {s.title}
            </button>
          );
        })}
      </nav>

      <div className="rounded-xl border p-4 bg-white">
        <current.View {...context} />
      </div>

      <div className="flex justify-between">
        <button
          className="px-3 py-1 rounded-md border"
          onClick={prev}
          disabled={isFirst}
        >
          Back
        </button>
        <button
          className="px-3 py-1 rounded-md border"
          onClick={next}
        >
          {isLast ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
