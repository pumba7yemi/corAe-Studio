#!/usr/bin/env node
// Check for deep imports into other workspace packages (disallow importing from src or dist paths)
import { readFileSync } from 'fs';
import pkg from 'glob';
const { glob } = pkg;

const BAD_PATTERNS = [/\/src\//, /\/dist\//];
let errors = 0;
const { statSync } = await import('node:fs');
const files = await new Promise((resolve, reject) => {
  // Only scan the app and packages areas under corAe-Studio to avoid node_modules and tools
  pkg('corAe-Studio/**/*.{ts,tsx,js,jsx,mjs,cjs}', { ignore: ['**/node_modules/**', 'corAe-Studio/.next/**', 'corAe-Studio/dist/**'] }, (err, matches) => {
    if (err) return reject(err);
    resolve(matches || []);
  });
});
for (const f of files) {
  try {
    const s = statSync(f);
    if (!s.isFile()) continue;
    const txt = readFileSync(f, 'utf8');
    for (const p of BAD_PATTERNS) {
      if (p.test(txt)) {
        console.error(`[check-deep-imports] Forbidden deep import in ${f}: matched ${p}`);
        errors++;
      }
    }
  } catch (err) {
    // skip files we can't read
    continue;
  }
}

if (errors) {
  console.error(`\nFound ${errors} deep-import issues. Use package-level imports like '@corae/foo' instead of deep src/dist.`);
  process.exit(1);
}

console.log('[check-deep-imports] OK');
