"use client";
import { useState } from "react";

type FeedItem = { id:string; kind:string; title:string; when:number; path:string; };

export default function FeedClient({ items }: { items: FeedItem[] }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? items : items.slice(0,5);

  return (
    <div className="mt-3 space-y-1 text-sm">
      {visible.map(it => (
        <div key={it.id} className="flex justify-between border-b py-1">
          <span className="truncate">{it.title}</span>
          <span className="text-xs text-gray-400">{new Date(it.when).toLocaleString()}</span>
        </div>
      ))}
      {items.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:underline mt-1"
        >
          {expanded ? "Show less" : `Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}