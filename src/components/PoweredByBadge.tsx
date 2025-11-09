// src/components/PoweredByBadge.tsx
"use client";

export function PoweredByBadge({ show = true }: { show?: boolean }) {
  if (!show) return null;

  return (
    <div className="mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs opacity-80">
      <span>⚡ Powered by</span>
      <strong>corAe OS²</strong>
    </div>
  );
}

export default PoweredByBadge;