"use client";
import React, { useState } from "react";

export default function ClientSurveyForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="p-4">
      <p className="text-sm text-slate-300">Client form placeholder for token: {token.slice(0, 8)}</p>
      <button
        onClick={() => {
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            setMsg("Saved (stub)");
          }, 300);
        }}
        className="mt-3 px-3 py-2 bg-emerald-600 text-white rounded"
        disabled={busy}
      >
        {busy ? "Saving…" : "Submit (stub)"}
      </button>
      {msg && <div className="mt-2 text-sm text-emerald-300">{msg}</div>}
    </div>
  );
}
