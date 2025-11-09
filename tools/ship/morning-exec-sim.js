#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findLogsDir(appCwd) {
  const rootLogs = path.resolve(appCwd, '..', '.logs');
  const localLogs = path.resolve(appCwd, '.logs');
  if (fs.existsSync(rootLogs)) return rootLogs;
  if (fs.existsSync(localLogs)) return localLogs;
  return rootLogs;
}

function getLatestSmokeLogText(logsDir) {
  if (!fs.existsSync(logsDir)) return {};
  const files = fs
    .readdirSync(logsDir)
    .filter((f) => f.startsWith('smoke-') && f.endsWith('.log'))
    .map((f) => ({ f, mtime: fs.statSync(path.join(logsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!files.length) return {};
  const file = path.join(logsDir, files[0].f);
  const text = fs.readFileSync(file, 'utf8');
  return { file, text };
}

function parseSmoke(text) {
  if (!text) return { ok: false, applied: false, ranAtISO: null };
  const ok = /"ok"\s*:\s*true/.test(text) || /ok:\s*true/.test(text);
  const applied = /"applied"\s*:\s*true/.test(text) || /applied:\s*true/.test(text);
  const tsMatch =
    text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/) ||
    (text.match(/(?<=SMOKE START ).+/) || []);
  const ranAtISO = tsMatch && tsMatch[0] ? tsMatch[0] : null;
  return { ok, applied, ranAtISO };
}

async function run() {
  const appCwd = process.cwd();
  const logsDir = findLogsDir(appCwd);
  const { file, text } = getLatestSmokeLogText(logsDir);
  const parsed = parseSmoke(text);

  const now = new Date();
  const ranDate = parsed.ranAtISO ? new Date(parsed.ranAtISO) : null;
  const ageMin = ranDate ? Math.max(0, (now.getTime() - ranDate.getTime()) / 60000) : Infinity;

  const data = {
    dateISO: now.toISOString(),
    business: 'corAe Mothership',
    kpis: file || parsed.ok !== undefined
      ? [
          { label: 'Ship Smoke', value: parsed.ok ? 'PASS' : 'FAIL', delta: ranDate ? `ran ${Math.floor(ageMin)}m ago` : 'no recent run' },
          { label: 'Updates Applied', value: parsed.applied ? 'Yes' : 'No' },
          { label: 'Latest Log', value: file ? path.basename(file) : '—' },
        ]
      : [
          { label: 'Sales (AED)', value: 128450, delta: '+6.2% vs yesterday' },
          { label: 'Cash Position (AED)', value: 482000 },
          { label: 'Stock Alerts', value: 3 },
        ],
    risks: [
      !parsed.ok && file
        ? { text: 'Smoke test failed or not found', level: 'high' }
        : ageMin > 720
        ? { text: 'Smoke test stale (>12h)', level: 'med' }
        : { text: 'All systems responsive', level: 'low' },
    ],
    actions: parsed.ok
      ? [
          { text: 'Proceed with daily build and Ship checks', due: 'Today' },
          { text: "Review last night’s cleanup in .logs if needed" },
        ]
      : [
          { text: 'Re-run local smoke-test', due: 'Now', link: 'pnpm smoke:ship' },
          { text: 'Start Ship dev server first if required' },
        ],
  };

  console.log(JSON.stringify({ logsDir, file: file || null, parsed, data }, null, 2));
}

run().catch((err) => { console.error(err); process.exit(1); });
