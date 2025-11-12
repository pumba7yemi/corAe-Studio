/* quick endpoint checker for 3x3dtd + obari demo
   Usage (PowerShell):
     $env:PORT=3001; node .\apps\studio\scripts\check-endpoints.mjs
   or
     node .\apps\studio\scripts\check-endpoints.mjs 3001
*/

const argPort = process.argv[2];
const argHost = process.argv[3];
const port = process.env.PORT || process.env.DEV_PORT || argPort || 3000;

// Try multiple host candidates so the checker works regardless of whether
// Next bound to IPv4 localhost, IPv6 ::1, or a network interface.
const hosts = argHost ? [argHost] : ["localhost", "127.0.0.1", "::1"];

async function findBase() {
  for (const h of hosts) {
    const url = `http://${h}:${port}/`;
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok || res.status === 200 || res.status === 404) {
        return `http://${h}:${port}`;
      }
    } catch (e) {
      // ignore and try next
    }
  }
  // fallback to localhost base (will likely fail)
  return `http://localhost:${port}`;
}

(async () => {
  const base = await findBase();
  console.log(`Checking endpoints at ${base} ...`);

async function check(path, opts) {
  const url = base + path;
  try {
    const res = await fetch(url, opts);
    const txt = await res.text();
    let body;
    try { body = JSON.parse(txt); } catch { body = txt; }
    console.log(`\n[${opts?.method ?? 'GET'}] ${url} -> ${res.status}`);
    console.log(body);
  } catch (e) {
    console.error(`\nERROR calling ${url}:`, e.message || e);
  }
}

  // 1. GET /api/obari/demo
  await check('/api/obari/demo');

  // 2. POST /api/obari/demo { action: 'next' }
  await check('/api/obari/demo', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action: 'next' }) });

  // 3. GET /api/email/3x3dtd
  await check('/api/email/3x3dtd');

  // 4. POST save -> store a small payload
  const payload = {
    action: 'save',
    data: {
      dateISO: new Date().toISOString(),
      priority: [{ id: 'p1', title: 'Priority test' }],
      ongoing: [{ id: 'o1', title: 'Ongoing test' }],
      inbox: [{ id: 'i1', title: 'Inbox test' }],
    }
  };
  await check('/api/email/3x3dtd', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });

  // 5. POST send -> dry-run or real send depending on SMTP env
  const sendBody = { action: 'send', to: 'me@example.com' };
  await check('/api/email/3x3dtd', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(sendBody) });

  console.log('\nChecks complete.');
})();
