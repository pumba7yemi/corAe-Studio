#!/usr/bin/env node
// Poll Studio /api/morning-exec until kpis[0].value === 'PASS' or timeout
const url = process.argv[2] || 'http://127.0.0.1:3002/api/morning-exec';
const timeoutMs = 5 * 60 * 1000; // 5 minutes
const end = Date.now() + timeoutMs;
(async () => {
  while (Date.now() < end) {
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log(new Date().toISOString(), 'KPIS:', JSON.stringify(json.kpis || []));
      const val = json && json.kpis && json.kpis[0] && json.kpis[0].value;
      if (val === 'PASS') {
        console.log('PASS detected');
        process.exit(0);
      }
    } catch (e) {
      console.log(new Date().toISOString(), 'Not ready:', e.message || e);
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.log('Timed out waiting for PASS');
  process.exit(2);
})();
