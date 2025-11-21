"use client";

import React from "react";
import { listShips } from "@/app/lib/ship/store";

export default function DockyardClient() {
  const [ships, setShips] = React.useState<any[]>([]);
  React.useEffect(() => {
    try {
      // listShips is a client-only helper returning synchronous list; wrap in Promise.resolve
      Promise.resolve(listShips()).then((s) => setShips(Array.isArray(s) ? s : [])).catch(console.error);
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="stack p-6">
      <h1 className="text-2xl font-semibold">Dockyard (Client)</h1>
      <p className="muted small">Client-rendered Dockyard — ships are loaded client-side.</p>
      <pre className="mt-4 overflow-auto p-3 bg-white border rounded">{JSON.stringify(ships, null, 2)}</pre>
    </div>
  );
}
