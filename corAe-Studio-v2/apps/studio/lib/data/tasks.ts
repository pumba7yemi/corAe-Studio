export async function fetchTasks() {
  const res = await fetch("/api/3cubed/tasks", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.tasks ?? [];
}
