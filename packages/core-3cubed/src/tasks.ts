// Minimal dev stub for 3cubed tasks
export type Task = { id: string; title: string; domain?: string; pipeline?: string; tags?: string[] };

const tasks = new Map<string, Task>();

export function listTasks() {
  return Array.from(tasks.values());
}

export function addTask(t: Task) {
  const id = t.id ?? `task_${Date.now()}`;
  tasks.set(id, { ...t, id });
}
