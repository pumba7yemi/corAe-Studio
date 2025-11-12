"use client";
import { useState } from "react";
import { ThreadFilters } from "@corae/ui/components/Inbox/ThreadFilters";
import { ThreadList } from "@corae/ui/components/Inbox/ThreadList";

export default function ClientInbox({ threads, modules }: any) {
  const [domain, setDomain] = useState<"All"|"Business"|"Work"|"Home">("All");
  const [pipeline, setPipeline] = useState<"Any"|"OBARI"|"HomeFlow"|"WorkFlow">("Any");

  const gate = (d: string) =>
    (d === "Business" && modules.Business) ||
    (d === "Work"     && modules.Work)     ||
    (d === "Home"     && modules.Home)     ||
    d === "All";

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Unified Mail</h2>
      <ThreadFilters onChange={(d, p)=>{ if (gate(d)) setDomain(d); setPipeline(p); }} />
      <ThreadList threads={threads} domain={domain} pipeline={pipeline} />
    </div>
  );
}

export function ModuleBadges({ modules }: any) {
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      { ["Business","Work","Home"].map(k => (
        <div key={k} className={`text-center text-xs px-2 py-1 rounded ${modules[k] ? "bg-green-100" : "bg-gray-200"}`}>{k}</div>
      )) }
    </div>
  );
}
