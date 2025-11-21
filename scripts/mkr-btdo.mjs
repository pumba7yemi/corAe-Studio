#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const appPath = path.join(repoRoot, 'apps', 'studio');
const dataPath = path.join(repoRoot, '.data', 'btdo');

const dirs = [
  path.join(appPath, 'app', 'api', 'btdo'),
  path.join(appPath, 'app', 'api', 'btdo', 'leads'),
  path.join(appPath, 'app', 'api', 'btdo', 'leads', '[id]'),
  path.join(appPath, 'app', 'api', 'btdo', 'leads', '[id]', 'events'),
  path.join(appPath, 'app', 'api', 'btdo', 'leads', '[id]', 'apply-template'),
  path.join(appPath, 'app', 'api', 'btdo', 'requirements'),
  path.join(appPath, 'app', 'btdo'),
  path.join(appPath, 'app', 'btdo', 'leads'),
];

for (const d of dirs) fs.mkdirSync(d, { recursive: true });
fs.mkdirSync(dataPath, { recursive: true });

const placeholders = [
  path.join(dataPath, '.keep'),
  path.join(appPath, 'app', 'api', 'btdo', '.keep'),
  path.join(appPath, 'app', 'btdo', '.keep')
];
for (const f of placeholders) try { fs.writeFileSync(f, 'keep', { flag: 'w' }); } catch (e) {}

console.log('MKR BTDO completed. Created folders and placeholder files.');
process.exit(0);
