import { getPillars } from "../../../../src/caia/overview";
import AtlasGateButton from "../../../../components/dev/AtlasGateButton";

export default function AtlasPage() {
  const pillars = getPillars();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">CAIA Atlas</h1>
      <p className="text-sm opacity-70">
        Canonical internal structure of CAIA (pillars, roots, tracks).
      </p>

      <div className="space-y-4">
        {pillars.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg p-4 hover:bg-neutral-50 transition"
          >
            <div className="font-semibold">{p.title}</div>
            <div className="text-xs text-neutral-600">{p.id}</div>
            <div className="text-xs mt-1 text-blue-700">{p.path}</div>
            <AtlasGateButton pillarId={p.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
