#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const root = process.cwd();
const workdir = path.join(root, 'apps', 'ship');
process.env.SHIP_UPDATE_ADMIN_SECRET = process.env.SHIP_UPDATE_ADMIN_SECRET || 'change-me';

// Start dev server in detached background process
console.log('Starting Next dev in background...');
const child = spawn('pnpm', ['exec', 'next', 'dev', '-p', '3000', '-H', '127.0.0.1'], { cwd: workdir, detached: true, stdio: 'ignore', shell: true });
child.unref();

// Wait for port to open (poll)
const max = 30;
let ok = false;
const fetchUrl = 'http://127.0.0.1:3000/api/shadow/ingest';
async function waitFor() {
  for (let i = 0; i < max; i++) {
    try {
      const res = await fetch(fetchUrl, { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-secret': process.env.SHIP_UPDATE_ADMIN_SECRET }, body: '{}' });
      if (res.ok) { ok = true; break; }
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

(async () => {
  await waitFor();
  if (!ok) { console.error('Dev server failed to start on :3000'); process.exit(2); }
  console.log('Dev server responding — running smoke test');
  // run smoke via the Node runner we added
  const run = spawn('node', [path.join(root, 'tools', 'ship', 'run-smoke.mjs')], { stdio: 'inherit', cwd: root, shell: true });
  run.on('exit', (c) => process.exit(c));
})();
