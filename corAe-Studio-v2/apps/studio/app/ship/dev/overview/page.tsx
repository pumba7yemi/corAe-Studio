import DevAgentOverview from "@/components/dev/DevAgentOverview";

export const metadata = {
  title: "Dev Agent Overview",
  description: "CAIA control tower for corAe builds.",
};

export default function Page() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dev Agent Overview</h1>
      <p className="text-sm text-neutral-600 mb-6">
        CAIA control tower for preflight, nightly sweeps, and current pillar/track.
      </p>
      <DevAgentOverview />
    </div>
  );
}
