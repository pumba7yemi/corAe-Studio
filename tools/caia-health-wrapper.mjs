#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(process.cwd());
const V2 = path.join(ROOT, 'corAe-Studio-v2');
const script = path.join(V2, 'tools', 'caia-health.mjs');

const res = spawnSync(process.execPath, [script, 'status'], { cwd: V2, stdio: 'inherit' });
process.exit(res.status ?? 1);
