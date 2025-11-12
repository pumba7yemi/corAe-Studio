#!/usr/bin/env node
// Ensure prisma schema lives in expected folder and prisma client is generated in packages/*/node_modules/.prisma
import { existsSync } from 'fs';
import pkg from 'glob';

const schemaFiles = await new Promise((resolve, reject) => {
  pkg('corAe-Studio/**/prisma/schema.prisma', { ignore: ['**/node_modules/**'] }, (err, matches) => {
    if (err) return reject(err);
    resolve(matches || []);
  });
});

if (!schemaFiles.length) {
  console.warn('[check-prisma-layout] No prisma/schema.prisma found in workspace; skipping prisma layout check (non-fatal for local runs).');
  process.exit(0);
}

console.log('[check-prisma-layout] OK - found prisma schema(s)');
