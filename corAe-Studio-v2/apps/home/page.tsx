"use client";

/**
 * corAe â€” Ship/Home (Brand-Unified Layout)
 * Matches DTD/CIMS dark slate theme.
 * Includes CAIA card, quick tiles, and @corae/home components.
 */

import dynamic from "next/dynamic";
import CaiaCard from "@/components/CaiaCard";

// Client-only versions to avoid hydration mismatches
const MealPlanner          = dynamic(() => import("@corae/home").then(m => m.MealPlanner), { ssr: false });
const CleaningScheduleTile = dynamic(() => import("@corae/home").then(m => m.CleaningScheduleTile), { ssr: false });
const FitnessTile          = dynamic(() => import("@corae/home").then(m => m.FitnessTile), { ssr: false });
const WardrobeTile         = dynamic(() => import("@corae/home").then(m => m.WardrobeTile), { ssr: false });
const GlamAndGlowTile      = dynamic(() => import("@corae/home").then(m => m.GlamAndGlowTile), { ssr: false });
const WhatIWantTile        = dynamic(() => import("@corae/home").then(m => m.WhatIWantTile), { ssr: false });
// Cast dynamic imports to `any` wrappers to allow passing decorative props like `id`
const MealPlannerAny = MealPlanner as any;
const CleaningScheduleTileAny = CleaningScheduleTile as any;
const FitnessTileAny = FitnessTile as any;
const WardrobeTileAny = WardrobeTile as any;
const GlamAndGlowTileAny = GlamAndGlowTile as any;
const WhatIWantTileAny = WhatIWantTile as any;
import { HomeData } from "@corae/home";
import { buildNav } from '../../../src/caia/nav-builder';

export default function ShipHomeSection() {
  return (
    <main className="page-home max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500">
              <span className="absolute inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-100">Home</h1>
          </div>
          <p className="text-sm text-slate-400">
            Personal hub â€” peace, routines, pantry, wellness, 3Â³DTD diary.
          </p>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          {buildNav().home.map((n: any) => (
            <a key={n.href} href={n.href} className="rounded-2xl border border-slate-700 px-3 py-1.5 hover:bg-slate-800/60">
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Faith Section â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="font-medium text-sky-200">Faith</h2>
        <p className="text-sm text-slate-400">
          Start with peace, then take the next right step.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="/ship/faith"
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60"
          >
            Faith Hub
          </a>
          <a
            href="/ship/faith/discern"
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60"
          >
            Discernment
          </a>
          <a
            href="/ship/faith/panic-peace"
            className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60"
          >
            Panic â†’ Peace
          </a>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ All Home Sections (quick links) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
        <h2 className="font-medium text-sky-200">Home Sections</h2>
        <p className="text-sm text-slate-400">Quick links to all Home areas.</p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <a href="/home/cleaning" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Cleaning</a>
          <a href="/home/maintenance" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Maintenance</a>
          <a href="/home/mealprep" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Meal Prep</a>
          <a href="/home/finance" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Finance</a>
          <a href="/home/fitness" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Fitness</a>
          <a href="/home/glamglow" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Glam &amp; Glow</a>
          <a href="/home/mindful" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Mindful</a>
          <a href="/home/shopping" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Shopping</a>
          <a href="/home/utilize" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Utilize</a>
          <a href="/home/wardrobe" className="rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/60">Wardrobe</a>
          <a href="/home/ascend/signup-loop" className="rounded-xl border border-amber-600 text-amber-300 px-3 py-2 text-sm hover:bg-amber-800/10">Ascend â€” Signup Loop</a>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Quick Tiles â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
          <h2 className="font-medium text-sky-200">Todayâ€™s Routine</h2>
          <ul className="text-sm mt-2 list-disc ml-4 text-slate-300">
            <li>Morning walk with Grogu</li>
            <li>Lemon water + coffee</li>
            <li>Check fridge/pantry stock</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
          <h2 className="font-medium text-sky-200">Reminders</h2>
          <ul className="text-sm mt-2 list-disc ml-4 text-slate-300">
            <li>Bill payment due Friday</li>
            <li>Rotate frozen meat stock</li>
          </ul>
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ corAe Home Tiles â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="c-home-tile rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <MealPlannerAny id="MealPlanner" title="Meal Planner" seed={HomeData.mealPlan} />
        </div>
        <div className="c-home-tile rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <CleaningScheduleTileAny id="CleaningSchedule" title="Cleaning" />
        </div>
        <div className="c-home-tile rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <FitnessTileAny id="Fitness" title="Fitness" />
        </div>
        <div className="c-home-tile rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <WardrobeTileAny id="Wardrobe" title="Wardrobe" />
        </div>
        <div className="c-home-tile rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <GlamAndGlowTileAny id="GlamAndGlow" title="Glam &amp; Glow" />
        </div>
        <div className="c-home-tile rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <WhatIWantTileAny id="WhatIWant" title="What I Want" />
        </div>
      </section>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ CAIA Card â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section>
        <CaiaCard href="/ship/caia" label="ðŸ§  CAIA (Ship)" subtitle="Home-aware assistant" />
      </section>
    </main>
  );
}
