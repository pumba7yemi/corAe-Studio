/* =============================================================================
 * corAe • Gym App Demo
 * Path: apps/studio/app/gym/body-scan/page.tsx
 *
 * Renders a mobile-style “BODY SCAN COMPLETE” screen like your mock.
 * - Tailwind-only (no extra deps except lucide-react for icons)
 * - Works as a standalone page
 * - Swap the `imageSrc` to your model/photo (uses <img> to avoid Next Image config)
 * ============================================================================= */

import { CheckCircle2, AlertTriangle } from "lucide-react";

const imageSrc =
  "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=640&auto=format&fit=crop"; // <- replace with your body scan image if you like

export default function BodyScanPage() {
  return (
    <div className="min-h-dvh bg-black text-white antialiased flex items-center justify-center p-4">
      {/* Phone frame */}
      <div
        className="relative w-[380px] max-w-full rounded-[36px] border border-white/10 bg-neutral-900 shadow-2xl"
        style={{
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Notch hint (simple) */}
        <div className="absolute left-1/2 top-0 z-10 h-6 w-40 -translate-x-1/2 rounded-b-2xl bg-black" />

        {/* Screen content area */}
        <div className="relative z-0 rounded-[36px] overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900 to-black" />

          <div className="relative px-6 pt-10 pb-8">
            {/* Title */}
            <h1 className="text-center text-[26px] font-extrabold tracking-wider">
              BODY SCAN COMPLETE
            </h1>

            {/* Person image */}
            <div className="mt-6 flex justify-center">
              <div className="relative h-72 w-52 overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/10">
                <img
                  src={imageSrc}
                  alt="Body scan"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                {/* Bottom fade */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            </div>

            {/* Results block */}
            <div className="mt-8 space-y-4 text-[15px] leading-6">
              <p>
                <span className="font-semibold">Your Frame:</span>{" "}
                <span className="font-extrabold">MESOMORPH</span>{" "}
                <span className="text-white/70">(70%)</span>
              </p>
              <p className="text-white/90">
                <span className="font-semibold">Secondary Traits:</span>{" "}
                <span className="font-extrabold">ENDOMORPH</span>{" "}
                <span className="text-white/70">(30%)</span>
              </p>

              <div className="mt-4">
                <p className="font-semibold mb-2">You respond best to:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Balanced carbs &amp; protein</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Strength + HIIT mix</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400 shrink-0" />
                    <span>3–4 days training + rest days</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300 shrink-0" />
                <p className="text-white/90">
                  Abs will show at <span className="font-semibold">13–14%</span> body fat
                </p>
              </div>
            </div>
          </div>

          {/* Home indicator bar */}
          <div className="pb-4 pt-1 flex justify-center">
            <div className="h-1.5 w-24 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}