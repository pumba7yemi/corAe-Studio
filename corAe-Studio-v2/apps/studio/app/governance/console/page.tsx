import Link from "next/link";

export default function GovernanceConsoleHome() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Governance Console (Studio)</h1>
      <p className="text-sm text-gray-600">
        Single edit point for corAe GOVERNANCE. Subject 1 / Admin only.
        Ships and OS layers are read-only.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/governance/console/subject1" className="rounded-2xl border p-4 hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Subject 1 Governance</h2>
          <p className="text-sm text-gray-600">
            Edit authoritative markdown laws and principles.
          </p>
        </Link>

        <Link href="/governance/console/runtime" className="rounded-2xl border p-4 hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Runtime Governance (Core)</h2>
          <p className="text-sm text-gray-600">
            Edit machine JSON toggles, flags, and runtime rules.
          </p>
        </Link>

        <Link href="/governance/console/ships" className="rounded-2xl border p-4 hover:bg-gray-50">
          <h2 className="text-lg font-semibold">Ship Governance</h2>
          <p className="text-sm text-gray-600">
            View / edit per-ship profiles and limits.
          </p>
        </Link>
      </div>
    </div>
  );
}
