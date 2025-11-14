#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const targetRoot = path.join(root, 'apps', 'studio', 'apps', 'ship');

const dirs = [
  path.join(targetRoot, 'app', 'signin'),
  path.join(targetRoot, 'app', 'api', 'session', 'select'),
  path.join(targetRoot, 'app', 'api', 'session', 'me'),
  path.join(targetRoot, 'app', '(core)', 'components'),
  path.join(targetRoot, 'app', 'business'),
  path.join(targetRoot, 'app', 'work'),
  path.join(targetRoot, 'app', 'home'),
  path.join(targetRoot, 'app', 'demo'),
  path.join(targetRoot, 'lib')
];

for (const d of dirs) fs.mkdirSync(d, { recursive: true });

const files = [
  path.join(targetRoot, 'app', 'signin', 'page.tsx'),
  path.join(targetRoot, 'app', 'api', 'session', 'select', 'route.ts'),
  path.join(targetRoot, 'app', 'api', 'session', 'me', 'route.ts'),
  path.join(targetRoot, 'app', '(core)', 'components', 'CompanySwitcher.tsx'),
  path.join(targetRoot, 'app', 'business', 'page.tsx'),
  path.join(targetRoot, 'app', 'work', 'page.tsx'),
  path.join(targetRoot, 'app', 'home', 'page.tsx'),
  path.join(targetRoot, 'app', 'demo', 'companies.ts'),
  path.join(targetRoot, 'lib', 'session.ts'),
  path.join(targetRoot, 'middleware.ts')
];

for (const f of files) {
  if (!fs.existsSync(f)) fs.writeFileSync(f, '', 'utf8');
}

console.log('corAe Ship Sign-in structure created successfully at', targetRoot);
process.exit(0);
