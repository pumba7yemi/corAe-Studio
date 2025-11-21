#!/usr/bin/env node
import { spawnSync } from 'child_process';
import path from 'path';

const root = process.cwd();
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['tsx', 'scripts/law.validate.ts'];

console.log('Running constitutional validator via tsx...');
const proc = spawnSync(npx, args, { stdio: 'inherit', cwd: root, shell: true });
process.exit(proc.status || 0);
