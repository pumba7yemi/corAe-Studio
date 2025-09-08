// apps/studio/app/comms/work/page.tsx
export default function Work3DTDPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">3³DTD</h1>
      <p className="text-sm text-gray-600">
        Decide • Do • Describe. Triage queue produced from Emails + OBARI context.
      </p>
      <div className="mt-4 border rounded-xl p-4 bg-white">
        <p className="text-gray-500 text-sm">Queue list will render here from /data/workbrain/queue.</p>
      </div>
    </div>
  );
}