import type { Metadata } from "next";
import { getAlignmentSummary, hasSignedSocialContract } from "@corae/core-ascend";
import AscendDashboard from "@/components/ascend/AscendDashboard";

export const metadata: Metadata = {
  title: "Ascend — Work",
  description: "Ascend through conduct — alignment first, then WorkFocus™.",
};

export default async function Page() {
  const [aligned, summary] = await Promise.all([
    hasSignedSocialContract(),
    getAlignmentSummary(),
  ]);

  if (!aligned) {
    return (
      <main className="max-w-3xl mx-auto py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Ascension Paused</h1>
          <p className="text-sm opacity-75">
            Complete your Social Contract audits across <strong>Home</strong>, <strong>Work</strong>, and <strong>Business</strong> to unlock Ascend.
          </p>
        </header>

        <div className="grid grid-cols-3 gap-3">
          <GateCard label="Home" ok={summary.home} href="/ship/home/social-contract" />
          <GateCard label="Work" ok={summary.work} href="/ship/work/social-contract" />
          <GateCard label="Business" ok={summary.business} href="/ship/business/social-contract" />
        </div>

        <div className="rounded-xl border p-4 text-sm">
          <p className="font-medium mb-1">Why this gate?</p>
          <p className="opacity-80">
            corAe prioritizes conduct and clarity. Alignment is a human-approved prerequisite — once complete, CAIA moves you forward.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8">
      <AscendDashboard />
    </main>
  );
}

function GateCard({ label, ok, href }: { label: string; ok: boolean; href: string }) {
  return (
    <a className="rounded-xl border p-4 focus:outline-none focus:ring" href={href}>
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-lg font-semibold mt-1">{ok ? "Aligned ✓" : "Pending •"}</div>
      <div className="text-xs underline mt-2 block">Review / complete</div>
    </a>
  );
}
