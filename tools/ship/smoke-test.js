#!/usr/bin/env node
// tools/ship/smoke-test.js
// Simple smoke test for Ship shadow + update APIs.
// Usage:
//   node tools/ship/smoke-test.js [baseUrl]
// Environment:
//   SHIP_UPDATE_ADMIN_SECRET or SHIP_SHADOW_ADMIN_SECRET or SHADOW_ADMIN_SECRET

const base = process.argv[2] || process.env.BASE_URL || 'http://localhost:3000';
const adminSecret = process.env.SHIP_UPDATE_ADMIN_SECRET || process.env.SHIP_SHADOW_ADMIN_SECRET || process.env.SHADOW_ADMIN_SECRET || '';

async function postJson(path, body, headers = {}) {
  // If an admin secret is configured for the smoke run, include it by default
  const authHeader = adminSecret ? { 'x-corae-admin-secret': adminSecret } : {};
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...authHeader, ...headers },
    body: JSON.stringify(body),
  });
  const txt = await res.text();
  let json;
  try { json = JSON.parse(txt); } catch (e) { json = txt; }
  return { status: res.status, ok: res.ok, body: json };
}

async function getJson(path) {
  const res = await fetch(base + path, { method: 'GET' });
  const txt = await res.text();
  let json;
  try { json = JSON.parse(txt); } catch (e) { json = txt; }
  return { status: res.status, ok: res.ok, body: json };
}

async function run() {
  console.log('Base URL:', base);
  const companyId = 'smoke-' + Date.now();

  console.log('\n1) POST /api/shadow/ingest (order.created)');
  const e1 = {
    companyId,
    type: 'order.created',
    occurredAt: new Date().toISOString(),
    source: 'smoke-test',
    payload: { orderId: 'S1', total: 12.5 },
  };
  const r1 = await postJson('/api/shadow/ingest', e1);
  console.log('=>', r1.status, JSON.stringify(r1.body));
  if (!r1.ok) throw new Error('ingest failed');

  console.log('\n2) POST /api/shadow/ingest (order.paid)');
  const e2 = { ...e1, id: 'evt-2', type: 'order.paid', payload: { orderId: 'S1', paid: true } };
  const r2 = await postJson('/api/shadow/ingest', e2);
  console.log('=>', r2.status, JSON.stringify(r2.body));
  if (!r2.ok) throw new Error('ingest failed');

  console.log(`\n3) GET /api/shadow/snapshot?companyId=${companyId}`);
  const s = await getJson(`/api/shadow/snapshot?companyId=${companyId}`);
  console.log('=>', s.status, JSON.stringify(s.body, null, 2));
  if (!s.ok) throw new Error('snapshot fetch failed');

  console.log('\n4) GET /api/update/check?clientVersion=0.0.1');
  const c = await getJson('/api/update/check?clientVersion=0.0.1');
  console.log('=>', c.status, JSON.stringify(c.body, null, 2));
  if (!c.ok) throw new Error('update check failed');

  if (!adminSecret) {
    console.warn('\nSKIP: /api/update/apply — no admin secret in env (set SHIP_UPDATE_ADMIN_SECRET)');
    return;
  }

  console.log('\n5) POST /api/update/apply (requires admin secret)');
  const applyBody = { targetVersion: '1.0.1', meta: 'smoke-test' };
  const a = await postJson('/api/update/apply', applyBody, { 'x-corae-admin-secret': adminSecret });
  console.log('=>', a.status, JSON.stringify(a.body, null, 2));
  if (!a.ok) throw new Error('update apply failed');

  console.log('\nSmoke test completed successfully.');
}

run().catch((err) => {
  console.error('Smoke test failed:', err && err.message ? err.message : err);
  process.exit(1);
});
