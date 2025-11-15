// packages/ui/components/AscendFlow.tsx

import React from "react";

type Step = {
  id: "HOME" | "WORK" | "BUSINESS" | "CREATOR";
  title: string;
  subtitle: string;
  description: string;
};

const STEPS: Step[] = [
  {
    id: "HOME",
    title: "Home",
    subtitle: "Become Whole",
    description:
      "Tidy your space, eat well, sleep, move, and get control of your basic finances and time.",
  },
  {
    id: "WORK",
    title: "Work",
    subtitle: "Become Valuable",
    description:
      "Show up calm, reliable, structured and accountable. Become the person promotions look for.",
  },
  {
    id: "BUSINESS",
    title: "Business",
    subtitle: "Become a Leader",
    description:
      "Manage people, systems, clients and outcomes with clarity, not chaos. Lead with structure.",
  },
  {
    id: "CREATOR",
    title: "Creator",
    subtitle: "Become Free",
    description:
      "Build your own business or brand, powered by corAe and supported by AI — your ascent, not your replacement.",
  },
];

export default function AscendFlow() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-4 md:p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-sky-400 mb-4">
        The Ascend Path
      </p>
      <div className="grid gap-4 md:grid-cols-4">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className="relative flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950/40 p-4"
          >
            <div className="text-xs text-slate-400 mb-2">
              Step {index + 1}
            </div>
            <h3 className="text-sm font-semibold text-slate-50">
              {step.title}
            </h3>
            <p className="text-xs text-sky-300 mb-2">{step.subtitle}</p>
            <p className="text-xs text-slate-300 flex-1">{step.description}</p>
            {index < STEPS.length - 1 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2">
                <span className="text-sky-400 text-lg">→</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-400">
        You don&apos;t have to jump to Creator in one move. corAe walks this
        path with you, starting from where you actually are today.
      </p>
    </div>
  );
}
