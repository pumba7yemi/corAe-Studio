#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const V2 = path.join(process.cwd(), 'corAe-Studio-v2');
const healthFile = path.join(V2, '.corae', 'caia-health.json');
const healthScript = path.join(V2, 'tools', 'caia-health.mjs');

function safeRead(file) {
  try { if (!fs.existsSync(file)) return null; return JSON.parse(fs.readFileSync(file,'utf8')); } catch(e) { return null; }
}

try {
  let health = safeRead(healthFile);
  if (!health && fs.existsSync(healthScript)) {
    spawnSync(process.execPath, [healthScript, 'status'], { cwd: V2, stdio: 'inherit' });
    health = safeRead(healthFile);
  }

  if (!health) {
    console.error('API CHECK: no health data');
    process.exit(2);
  }

  console.log('HTTP/1.1 200 OK');
  console.log(JSON.stringify(health, null, 2));
  process.exit(0);
} catch (e) {
  console.error('API CHECK ERROR', e && e.message ? e.message : e);
  process.exit(3);
}
