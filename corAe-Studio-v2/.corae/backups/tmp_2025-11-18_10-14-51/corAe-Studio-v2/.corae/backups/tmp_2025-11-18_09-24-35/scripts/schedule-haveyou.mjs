#!/usr/bin/env node
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const base = process.argv[2] || 'http://localhost:3000';

async function tick() {
  try {
    const res = await fetch(`${base}/api/ship/haveyou/tick?all=1`, { method: 'GET' });
    console.log('Tick status:', res.status);
  } catch (e) {
    console.error('Tick failed:', e.message || e);
  }
}

if (process.argv.includes('--once')) {
  tick();
  process.exit(0);
}

console.log('To schedule recurring HaveYou ticks use your OS scheduler to call:');
console.log(`  node ${path.join(root,'scripts','schedule-haveyou.mjs')} ${base} --once`);
console.log('This script executes one tick when called with --once. Creating system scheduled tasks is platform-specific and requires elevated privileges.');
