#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const root = process.cwd();

function rmrf(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch (e) { }
}

// Clean build artifacts similar to the PowerShell script
const folders = ['.next', 'apps/ship/.next', 'apps/studio/.next'];
for (const f of folders) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    try { rmrf(p); console.log(`Removed ${f}`); } catch (e) { }
  }
}

console.log('Starting corAe Ship app (dev) via pnpm...');
const child = spawn('pnpm', ['--filter', '@corae/ship', 'dev'], { stdio: 'inherit', cwd: root, shell: true });
child.on('exit', (code) => process.exit(code));
