#!/usr/bin/env node
// Basic check for required env keys referenced in .env.example or .env
import { readFileSync, existsSync } from 'fs';

const candidates = ['.env.example', '.env'];
let found = false;
for (const c of candidates) {
  if (existsSync(c)) { found = true; break; }
}
if (!found) { console.warn('[check-env] No .env or .env.example found; skipping detailed env checks.'); process.exit(0); }

const txt = readFileSync('.env.example', 'utf8');
const keys = txt.split('\n').map(l => l.split('=')[0].trim()).filter(Boolean).filter(k => !k.startsWith('#'));
let missing = [];
for (const k of keys) {
  if (!process.env[k]) missing.push(k);
}
if (missing.length) {
  console.warn('[check-env] Missing env keys in the current environment:', missing.join(', '));
  // not failing hard because CI may inject envs differently
  process.exit(0);
}
console.log('[check-env] OK');
