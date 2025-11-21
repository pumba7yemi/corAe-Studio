"use client";
import { useState, useMemo } from "react";

export default function BuildSelector({ initial }: { initial: any[] }) {
  const [kind, setKind] = useState("white-label");
  const [selected, setSelected] = useState("");

  const filtered = useMemo(() => initial.filter(b => b.kind === kind), [initial, kind]);

  return (
    <div className="rounded-xl border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Type:</label>
        <select className="rounded-md border px-2 py-1 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="white-label">White-label Builds</option>
          <option value="core">corAe Core Builds</option>
        </select>

        <label className="text-sm ml-2">Build:</label>
        <select className="min-w-[260px] flex-1 rounded-md border px-2 py-1 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {filtered.map((b) => (
            <option key={b.name} value={b.name}>
              {b.name}
            </option>
          ))}
          {filtered.length === 0 && <option value="">— none —</option>}
        </select>
      </div>
    </div>
  );
}
