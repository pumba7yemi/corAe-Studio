#!/usr/bin/env node
// Ensure 'use client'/'use server' directives are present only where expected in the app/ folder
import { readFileSync } from 'fs';
import pkg from 'glob';
const { glob } = pkg;

const files = await glob('app/**/*.tsx', { ignore: ['**/node_modules/**'] });
let issues = 0;
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  const hasClient = /['"]use client['"]/m.test(txt);
  const hasServer = /['"]use server['"]/m.test(txt);
  if (hasClient && hasServer) {
    console.error(`[check-next-directives] ${f} has both 'use client' and 'use server'`);
    issues++;
  }
}

if (issues) { console.error('\nFound directive issues.'); process.exit(1); }
console.log('[check-next-directives] OK');
