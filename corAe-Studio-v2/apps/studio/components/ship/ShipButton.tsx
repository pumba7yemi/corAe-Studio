"use client";

import { useState } from "react";

export default function ShipButton() {   // 👈 this must be default
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);

      // Call your API route
      const res = await fetch("/api/ship/export");
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);

      // Stream -> Blob -> Download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;

      // try to parse Content-Disposition filename
      const cd = res.headers.get("Content-Disposition") || "attachment; filename=ship.zip";
      const match = cd.match(/filename=\"?([^\";]+)\"?/);
      a.download = match?.[1] || "ship.zip";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert((err as Error).message || "Export error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="px-4 py-2 rounded-2xl shadow bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Shipping…" : "Ship (One-Build)"}
    </button>
  );
}
