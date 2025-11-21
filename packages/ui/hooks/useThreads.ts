import { useEffect, useState } from "react";

export function useThreads() {
  const [threads, setThreads] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/obari/threads", { cache: "no-store" });
      const j = await res.json();
      setThreads(j.threads ?? []);
    })();
  }, []);
  return { threads };
}
