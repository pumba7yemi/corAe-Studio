#!/usr/bin/env node
// Check for deep imports into other workspace packages (disallow importing from src or dist paths)
import { readFileSync } from 'fs';
import pkg from 'glob';
const { glob } = pkg;

const BAD_PATTERNS = [/\/src\//, /\/dist\//];
let errors = 0;

const files = await glob('**/*.{ts,tsx,js,jsx,mjs,cjs}', { ignore: ['node_modules/**', 'pnpm-lock.yaml', 'dist/**', '.next/**'] });
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  for (const p of BAD_PATTERNS) {
    if (p.test(txt)) {
      console.error(`[check-deep-imports] Forbidden deep import in ${f}: matched ${p}`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`\nFound ${errors} deep-import issues. Use package-level imports like '@corae/foo' instead of deep src/dist.`);
  process.exit(1);
}

console.log('[check-deep-imports] OK');
