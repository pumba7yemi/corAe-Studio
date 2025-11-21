import { useEffect, useState } from "react";

export type PulseSummary = {
  timeSavedMin: number;
  flowRating: number;
  purposeIndex: number;
  updatedAt: string;
};

export function usePulse(refreshMs = 60000) {
  const [data, setData] = useState<PulseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/pulse/summary", { cache: "no-store" });
      if (!res.ok) throw new Error("summary fetch failed");
      const json = await res.json();
      setData(json.summary);
      setError(null);
    } catch (e: any) {
      setError(e.message || "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return { data, loading, error, reload: load };
}
