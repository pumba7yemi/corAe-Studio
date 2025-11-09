// tools/smoke-cims.js
// Simple Node smoke tester for /api/cims/sessions
// Usage: node tools/smoke-cims.js

const os = require('os');
const ports = [3000, 3001, 3002, 3003];

function getLocalAddrs() {
  const ifs = os.networkInterfaces();
  const addrs = new Set(['localhost', '127.0.0.1']);
  for (const k of Object.keys(ifs)) {
    for (const ni of ifs[k] || []) {
      if (ni.family === 'IPv4' && !ni.internal) addrs.add(ni.address);
    }
  }
  return Array.from(addrs);
}

async function run() {
  const addrs = getLocalAddrs();
  for (const p of ports) {
    for (const host of addrs) {
      const base = `http://${host}:${p}`;
      try {
        console.log(`Trying ${base} ...`);
        const res = await fetch(`${base}/api/cims/sessions`);
        if (!res.ok) {
          console.log(`GET ${base}/api/cims/sessions -> ${res.status}`);
          continue;
        }
        const body = await res.json();
        console.log(`GET OK on ${base}:`, JSON.stringify(body, null, 2));

        // Try POST
        const postBody = { user: 'smoke-user', label: 'smoke' };
        try {
          const postRes = await fetch(`${base}/api/cims/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postBody),
          });
          const postText = await postRes.text();
          console.log(`POST -> ${postRes.status}:`, postText);
        } catch (e) {
          console.error('POST failed:', e.message);
        }

        // Try DELETE
        try {
          const delRes = await fetch(`${base}/api/cims/sessions`, { method: 'DELETE' });
          const delText = await delRes.text();
          console.log(`DELETE -> ${delRes.status}:`, delText);
        } catch (e) {
          console.error('DELETE failed:', e.message);
        }

        process.exit(0);
      } catch (err) {
        // try next host
      }
    }
  }
  console.error('No port responded (tried hosts on ports 3000-3003)');
  process.exit(1);
}

run();
