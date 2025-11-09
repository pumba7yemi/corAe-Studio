// apps/studio/src/components/CaiaPanel.tsx
"use client";

export default function CaiaPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
      <div className="h-full w-80 bg-white shadow-xl p-6 rounded-l-2xl">
        <h2 className="text-lg font-semibold">CAIA Panel (stub)</h2>
        <p className="mt-2 text-sm text-slate-600">
          This will be the assistant panel.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            className="rounded-xl bg-slate-200 px-3 py-1.5 text-sm hover:bg-slate-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}