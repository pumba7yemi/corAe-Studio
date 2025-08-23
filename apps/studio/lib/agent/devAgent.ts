import fs from 'node:fs/promises';
import path from 'node:path';

type Payload = Record<string, any>;

export async function runDevAgent(task: string, payload: Payload) {
  switch (task) {
    case 'ping':
      return { message: 'pong', ts: new Date().toISOString() };

    case 'health':
      return await healthCheck();

    case 'version':
      return await readPackageVersion();

    case 'list-pages':
      return await listSimplePages();

    case 'echo':
      return { echo: payload ?? null };

    default:
      throw new Error(Unknown task: );
  }
}

async function healthCheck() {
  // minimal internal checks (expand later)
  const cwd = process.cwd();
  const nextDir = path.join(cwd, '.next');
  let hasBuild = false;
  try {
    const stat = await fs.stat(nextDir);
    hasBuild = stat.isDirectory();
  } catch {
    hasBuild = false;
  }
  return {
    status: 'ok',
    cwd,
    hasBuild,
    time: new Date().toISOString(),
  };
}

async function readPackageVersion() {
  const pkgPath = path.join(process.cwd(), 'package.json');
  const raw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(raw);
  return {
    name: pkg.name,
    version: pkg.version,
    deps: pkg.dependencies || {},
  };
}

async function listSimplePages() {
  // Static list for now; replace with real FS scan of app/ later
  return {
    pages: ['/', '/dashboard', '/clients', '/projects', '/settings', '/agent'],
  };
}
