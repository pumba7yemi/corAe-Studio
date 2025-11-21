// apps/studio/lib/agent/tasks.ts
import fs from 'node:fs/promises';
import path from 'node:path';

export type TaskName =
  | 'ping'
  | 'health'
  | 'version'
  | 'list-pages'
  | 'echo'
  | 'touch-file'; // example real action

export type TaskPayload = Record<string, any>;
export type TaskResult = any;

export type TaskHandler = (payload: TaskPayload) => Promise<TaskResult>;

const tasks = new Map<TaskName, TaskHandler>();

export function registerTask(name: TaskName, handler: TaskHandler) {
  tasks.set(name, handler);
}

export function getTask(name: string): TaskHandler | undefined {
  return tasks.get(name as TaskName);
}

export function listTasks(): TaskName[] {
  return Array.from(tasks.keys());
}

// ---- Built-in task implementations ----

registerTask('ping', async () => ({
  message: 'pong',
  ts: new Date().toISOString(),
}));

registerTask('health', async () => {
  const cwd = process.cwd();
  const nextDir = path.join(cwd, '.next');
  let hasBuild = false;
  try {
    const stat = await fs.stat(nextDir);
    hasBuild = stat.isDirectory();
  } catch {
    hasBuild = false;
  }
  return { status: 'ok', cwd, hasBuild, time: new Date().toISOString() };
});

registerTask('version', async () => {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const raw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  return { name: pkg.name, version: pkg.version, deps: pkg.dependencies || {} };
});

registerTask('list-pages', async () => {
  return { pages: ['/', '/dashboard', '/clients', '/projects', '/settings', '/agent'] };
});

registerTask('echo', async (payload) => ({ echo: payload ?? null }));

// Example “real” task just to prove FS access
registerTask('touch-file', async (payload) => {
  const rel = String(payload?.path || 'tmp/agent.touch');
  const abs = path.join(process.cwd(), rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, `touched at ${new Date().toISOString()}\n`, { flag: 'a' });
  return { touched: rel };
});