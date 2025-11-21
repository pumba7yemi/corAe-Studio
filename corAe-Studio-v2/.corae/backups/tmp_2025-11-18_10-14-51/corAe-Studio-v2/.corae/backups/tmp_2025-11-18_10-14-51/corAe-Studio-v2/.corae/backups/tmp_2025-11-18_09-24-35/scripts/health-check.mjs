#!/usr/bin/env node
// Use global fetch available in Node 18+; avoid external dependency.
async function check(url, opts = {}) {
  try {
    const r = await fetch(url, opts);
    console.log(`${url} -> ${r.status}`);
    return r.ok;
  } catch (e) {
    console.error(`${url} -> error`, e.message || e);
    return false;
  }
}

async function main() {
  const base = process.argv[2] || 'http://127.0.0.1:3001';
  console.log('[health-check] Using base', base);
  const obari = await check(`${base}/api/obari/demo`);
  const email = await check(`${base}/api/email/3x3dtd`);
  if (obari && email) {
    console.log('\n[health-check] ✅ All health checks passed');
    process.exit(0);
  } else {
    console.log('\n[health-check] ❌ One or more checks failed');
    process.exit(2);
  }
}

import http from 'http';
