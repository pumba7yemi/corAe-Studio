import { useEffect, useState } from "react";

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/3cubed/tasks", { cache: "no-store" });
      const j = await res.json();
      setTasks(j.tasks ?? []);
    })();
  }, []);
  return { tasks };
}
