// apps/studio/app/comms/emails/page.tsx
export default function EmailsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Emails</h1>
      <p className="text-sm text-gray-600">
        Inbox viewer & normalization. Outputs to <strong>workbrain (3³DTD)</strong> and
        <strong> CIMS</strong>, using <strong>OBARI</strong> for best-deal and policy context.
      </p>
      {/* Hook up to /api/comms/emails/queue later */}
      <div className="mt-4 border rounded-xl p-4 bg-white">
        <p className="text-gray-500 text-sm">No UI wired yet — data feed connects here.</p>
      </div>
    </div>
  );
}
