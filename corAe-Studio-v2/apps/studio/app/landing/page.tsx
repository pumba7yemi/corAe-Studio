import PulseWidget from "@/components/pulse/PulseWidget";
import { PULSE_ENABLED } from "@/lib/flags";

export const metadata = { title: "Energy Reclaimed • corAe" };

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-20">
      {/* Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">You weren’t designed to run on burnout.</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          corAe frees your mind from the noise — automating daily tasks so your energy, focus, and flow return to what truly matters.
        </p>
        <div className="flex justify-center">
          <a href="/onboarding" className="rounded-2xl px-5 py-3 bg-black text-white text-sm font-medium shadow-md">Start Restoring Your Energy</a>
        </div>
      </section>

      {/* Sacred Energy */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Your mind is sacred energy</h2>
          <p className="text-muted-foreground">
            Every thought, task, and worry drains energy. corAe reclaims that energy by turning logic into rhythm — tracking your mental load, automating the repetitive, and syncing your tasks to your true purpose.
          </p>
        </div>
        <div className="rounded-2xl border p-8 text-center">🪫 → 🔋 Energy flowing back to you</div>
      </section>

      {/* Pulse Engine */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Introducing the corAe Pulse Engine™</h2>
        <p className="text-muted-foreground">The Pulse connects Work, Home, Faith, and Focus to show where your time, flow, and peace are being spent.</p>
        {PULSE_ENABLED && <PulseWidget />}
      </section>

      {/* Purpose in Motion */}
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="rounded-2xl border p-8 text-center">Faith → Focus → Flow → Fulfilment → Faith</div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Purpose in motion</h3>
          <p className="text-muted-foreground">Faith without rhythm fades. corAe helps you act with alignment — transforming energy into intention, and intention into impact.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h3 className="text-2xl font-semibold">Start living with energy that builds you up</h3>
        <p className="text-muted-foreground">Every saved minute — that’s your spirit returning home.</p>
        <div className="flex justify-center">
          <a href="/onboarding" className="rounded-2xl px-5 py-3 bg-black text-white text-sm font-medium shadow-md">Activate Your corAe Pulse</a>
        </div>
      </section>
    </main>
  );
}

