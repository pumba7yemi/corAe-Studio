// apps/studio/app/ascend/page.tsx

import AscendFlow from "../../../../packages/ui/components/AscendFlow";
import AscendCard from "../../components/AscendCard";

export const metadata = {
  title: "corAe Ascend — The Path from Home to Creator",
  description:
    "The corAe Ascend Story — from stabilising your home and finances, to becoming valuable at work, to leading a business and finally becoming a Creator.",
};

export default function AscendPage() {
  return (
    <main className="min-h-screen w-full bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        <header className="space-y-4">
          <p className="text-xs tracking-[0.25em] uppercase text-sky-400">
            corAe Ascend™
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
            Before you rise in the world,{" "}
            <span className="text-sky-300">you must rise within yourself.</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl">
            Ascend is the human story threaded through{" "}
            <span className="font-medium">Home → Work → Business → Creator</span>.
            It’s how corAe helps you reclaim time, stabilise your life, and
            build the future you were meant to live.
          </p>
        </header>

        <section>
          <AscendFlow />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            1. The truth no one teaches you
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Everyone talks about success, business, and money. But almost nobody
            asks the first question:
          </p>
          <p className="text-sm md:text-base font-medium text-slate-100 italic">
            What does a successful person actually look like?
          </p>
          <p className="text-sm md:text-base text-slate-300">
            Not the filtered version. Not the slogan. The real human behind
            ambition. Most people fail not from lack of talent but from broken
            foundations. Chaos inside becomes chaos outside.
          </p>
          <p className="text-sm md:text-base text-sky-300">
            corAe Ascend™ exists to fix foundations before you try to build
            skyscrapers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            2. Broken people rarely build
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Before you run a business, you must run your life. Before you manage
            people, you must manage yourself. Before you climb, you must
            stabilise your footing.
          </p>
          <ul className="text-sm md:text-base text-slate-300 list-disc pl-5 space-y-1">
            <li>A calm, ordered mind</li>
            <li>Steady routines and sleep</li>
            <li>A healthy body and movement</li>
            <li>A grounded spirit and values</li>
            <li>A tidy home and simple systems</li>
            <li>Basic financial control</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            3. Your first duty: yourself. Your second: society.
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Your first duty is to become a whole human being. Your second duty
            is your social contract: be a good citizen, tell the truth, cause no
            harm, build more than you take.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            4. The grind is not the goal — it&apos;s the launchpad
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Many wake, gym, eat, work, repeat. That’s the grind. Ascend doesn’t
            judge the grind — it refuses to leave you trapped there.
          </p>
          <p className="text-sm md:text-base text-slate-100 font-medium">
            corAe reclaims your time and removes chaos so you can move from
            survival → structure → creation.
          </p>
        </section>

        <section className="space-y-4 border border-sky-900/50 rounded-2xl p-4 md:p-6 bg-slate-900/40">
          <h2 className="text-xl md:text-2xl font-semibold">
            5. The Eagle &amp; The Crow — rise above
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            The crow attacks from behind. The eagle never fights — it rises.
            Higher. Until the crow cannot breathe.
          </p>
          <p className="text-sm md:text-base text-slate-300">
            Ascend teaches altitude over argument. You don’t win every fight —
            you rise above most of them.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            6. Finance is fuel — it buys time
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Money is oxygen. Not the goal. The fuel. With it you buy stability,
            breathing room, and time — the true currency of Ascend.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            7. Home → Work → Business → Creator
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            Ascend mirrors the natural human growth arc:
          </p>
          <ul className="text-sm md:text-base text-slate-300 list-disc pl-5 space-y-1">
            <li>Home: stabilise your routines, finances and time.</li>
            <li>Work: become reliable and valuable.</li>
            <li>Business: learn to lead with clarity.</li>
            <li>Creator: build your own business or brand.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl md:text-2xl font-semibold">
            8. AI corAe is here to lift — not replace
          </h2>
          <p className="text-sm md:text-base text-slate-300">
            AI will replace tasks. corAe replaces chaos. It frees your time,
            strengthens your structure and helps you rise into roles AI cannot
            take — selling, thinking, leading, creating.
          </p>
        </section>

        <section className="space-y-6 border-t border-slate-800 pt-8">
          <h2 className="text-xl md:text-2xl font-semibold">
            9. The call to rise
          </h2>

          <div className="grid gap-4 md:grid-cols-4">
            <AscendCard label="Start at Home" href="/home" />
            <AscendCard label="Strengthen Work" href="/work" />
            <AscendCard label="Prepare for Business" href="/business" />
            <AscendCard label="Build as Creator" href="/shop" />
          </div>
        </section>
      </div>
    </main>
  );
}
