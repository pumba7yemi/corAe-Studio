// OBARI Landing Block — React + Tailwind (corAe build-ready)
// -----------------------------------------------------------

import React from "react";

export default function ObariLanding() {
  return (
    <section className="relative overflow-hidden bg-white text-zinc-900">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-zinc-100 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-zinc-100 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        {/* Eyebrow */}
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-500">
          corAe • OBARI™
        </p>

        {/* Headline */}
        <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Structure. Rhythm. Precision.{" "}
          <span className="block text-zinc-600">
            Meet <span className="font-bold">OBARI™</span> — the Flow Engine of corAe.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-700">
          A system that doesn’t run away with itself — it <span className="italic">flows</span>.{" "}
          Everything you do stays fenced, timed, and calm.{" "}
          <span className="font-medium">Pulse</span> is your window to all of it.
        </p>

        {/* OBARI chain pill */}
        <div className="mt-8 inline-flex flex-wrap items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-4 py-2 text-sm text-zinc-700 shadow-sm backdrop-blur">
          <span className="font-medium">OBARI™</span>
          <span className="text-zinc-400">=</span>
          <span>Order</span>
          <span className="text-zinc-400">→</span>
          <span>Booking</span>
          <span className="text-zinc-400">→</span>
          <span>Active</span>
          <span className="text-zinc-400">→</span>
          <span>Reporting</span>
          <span className="text-zinc-400">→</span>
          <span>Invoice</span>
        </div>

        {/* 28-day advantage + Pulse callout */}
        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 md:grid-cols-5">
          <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm md:col-span-3">
            <h4 className="text-base font-semibold">The 28-Day Advantage</h4>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-700">
              <li>• Predictable 4-week heartbeat for orders, deliveries, and cashflow</li>
              <li>• POS-driven forecasting with automatic stock logic</li>
              <li>• AI oversight that observes everything so you can focus on what matters</li>
              <li>• FileLogic™ archives each week in its own digital fence</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm md:col-span-2">
            <h4 className="text-base font-semibold">Pulse</h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              One calm window into your entire operation. Movement without motion — the heartbeat of your business, steady and clear.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#how-obari-works"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow transition hover:bg-zinc-800"
          >
            See the Flow
          </a>
          <a
            href="#pulse-demo"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100"
          >
            Experience Pulse
          </a>
          <a
            href="#join"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100"
          >
            Join the Rhythm
          </a>
        </div>
      </div>
    </section>
  );
}