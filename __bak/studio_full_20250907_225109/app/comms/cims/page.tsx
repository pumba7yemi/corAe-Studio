// apps/studio/app/comms/cims/page.tsx
export default function CimsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">CIMS</h1>
      <p className="text-sm text-gray-600">
        Auto-draft and overseer-gated sending. Low-risk items can auto-send per policy.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mt-4">
        <a href="/cims" className="border rounded-xl p-4 bg-white hover:shadow-sm">
          <div className="text-sm font-medium">Open Queue</div>
          <div className="text-xs text-gray-500">Drafts, Outbox, Sent</div>
        </a>
        <a href="#" className="border rounded-xl p-4 bg-white hover:shadow-sm">
          <div className="text-sm font-medium">Policies</div>
          <div className="text-xs text-gray-500">/data/cims/policies/policy.json</div>
        </a>
        <a href="#" className="border rounded-xl p-4 bg-white hover:shadow-sm">
          <div className="text-sm font-medium">Logs</div>
          <div className="text-xs text-gray-500">/data/cims/logs</div>
        </a>
      </div>
    </div>
  );
}