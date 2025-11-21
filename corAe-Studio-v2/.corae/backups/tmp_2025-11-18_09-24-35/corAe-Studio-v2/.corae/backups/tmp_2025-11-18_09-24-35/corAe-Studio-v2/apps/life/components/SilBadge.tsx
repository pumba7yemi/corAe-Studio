"use client";

export default function SilBadge({ domain, certainty }: { domain?: string | null, certainty?: number | null }) {
  return (
    <div className="px-3 py-1 rounded-md bg-blue-900/40 text-blue-200 text-xs">
      SIL → {domain || 'unknown'} ({certainty ?? 0})
    </div>
  );
}
