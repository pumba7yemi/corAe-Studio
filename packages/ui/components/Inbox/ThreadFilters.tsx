"use client";
import { useState } from "react";

export type Domain = "Business" | "Work" | "Home" | "All";
export type Pipeline = "Any" | "OBARI" | "HomeFlow" | "WorkFlow";

export function ThreadFilters({ onChange }: { onChange: (d: Domain, p: Pipeline) => void }) {
  const [d, setD] = useState<Domain>("All");
  const [p, setP] = useState<Pipeline>("Any");
  return (
    <div className="flex gap-2 items-center mb-3">
      <select className="border rounded px-2 py-1" value={d} onChange={(e)=>{ const v=e.target.value as Domain; setD(v); onChange(v, p); }}>
        <option>All</option><option>Business</option><option>Work</option><option>Home</option>
      </select>
      <select className="border rounded px-2 py-1" value={p} onChange={(e)=>{ const v=e.target.value as Pipeline; setP(v); onChange(d, v); }}>
        <option>Any</option><option>OBARI</option><option>HomeFlow</option><option>WorkFlow</option>
      </select>
    </div>
  );
}
