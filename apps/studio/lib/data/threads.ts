export async function fetchThreads() {
  const res = await fetch("/api/obari/threads", { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.threads ?? [];
}
