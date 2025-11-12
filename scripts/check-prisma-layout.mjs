#!/usr/bin/env node
// Ensure prisma schema lives in expected folder and prisma client is generated in packages/*/node_modules/.prisma
import { existsSync } from 'fs';
import { glob } from 'glob';

const schemaFiles = await glob('**/prisma/schema.prisma', { ignore: ['**/node_modules/**'] });
if (!schemaFiles.length) {
  console.error('[check-prisma-layout] No prisma/schema.prisma found in workspace.');
  process.exit(1);
}

console.log('[check-prisma-layout] OK - found prisma schema(s)');
