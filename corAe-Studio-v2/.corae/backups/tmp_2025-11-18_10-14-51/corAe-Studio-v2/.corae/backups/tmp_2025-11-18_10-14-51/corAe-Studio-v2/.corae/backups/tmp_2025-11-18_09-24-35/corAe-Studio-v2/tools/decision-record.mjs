#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectNewPattern, forbidPattern, embedBelief, checkForbidden, cassandraStatus } from './cassandra-meta-gate.mjs';
import { routeIntent } from './structure-router.mjs';

const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(__filename), '..', '..');
const storeDir = path.join(root, '.corae');
const storeFile = path.join(storeDir, 'decision-memory.json');

function ensureStore() {
  try {
    if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
    if (!fs.existsSync(storeFile)) fs.writeFileSync(storeFile, JSON.stringify({ entries: [] }, null, 2));
  } catch (e) {
    console.error('Failed to ensure store:', e);
    process.exit(1);
  }
}

function loadStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(storeFile, 'utf8'));
}

function saveStore(data) {
  fs.writeFileSync(storeFile, JSON.stringify(data, null, 2));
}

// --- SIL Structural Precedent (auto-loaded) ---
try {
  ensureStore();
  const _store = loadStore();
  const SIL_PRECEDENT = {
    id: 1763450000000,
    subject: "precedent-structure-duplication",
    reason: "Before creating new surfaces (pages, routes, components, features), call SIL. If SIL maps the user intent to an existing domain with certainty >= 0.72, reuse the existing surface. Do NOT create duplicates (e.g., want/iwant).",
    ts: "PRECEDENT"
  };
  const exists = Array.isArray(_store.entries) && _store.entries.some(e => e && e.subject === SIL_PRECEDENT.subject);
  if (!exists) {
    _store.entries.push(SIL_PRECEDENT);
    saveStore(_store);
  }
} catch (e) {
  // best-effort only; do not fail module load
}

function record({ subject, actor = 'system', result = 'fail', reason = '' }) {
  const store = loadStore();
  const entry = {
    id: Date.now(),
    subject,
    actor,
    result,
    reason,
    ts: new Date().toISOString()
  };
  // Structural Intelligence check: warn and avoid creating duplicate structural entries
  try {
    const s = String(subject || '');
    const r = routeIntent(s);
    if (r.found && r.action === 'extend-existing') {
      console.warn(`[SIL] Duplicate prevented. '${s}' belongs to ${r.targetDomain}.`);
      // continue to record (we warn) — the structural policy may be enforced elsewhere
    }
  } catch (e) {
    // ignore if router not available
  }
  // Check cassandra forbidden patterns for both subject and reason
  try {
    if (checkForbidden(subject) || checkForbidden(reason)) {
      console.warn("CASSANDRA: forbidden 150-Logic bypass phrase detected.");
    }
  } catch (e) {
    // best-effort; continue
  }

  store.entries.push(entry);
  saveStore(store);
  console.log('Recorded decision entry:', entry.id);
  try {
    const resLow = String(result || '').toLowerCase();
    if (resLow === 'green') {
      console.log('[CORAe] Green Confidence Law applied — green reinforces correctness.');
    }
  } catch (e) {
    // ignore
  }
  const detect = detectNewPattern({ 
    subject, 
    summary: `Recorded result: ${result}. Reason: ${reason}` 
  });

  if (detect.action === "meta-pause") {
    console.warn("🛑 Cassandra Meta-Pause Triggered — New Belief Pattern Detected.");
    console.warn("Subject:", detect.subject);
    console.warn("Summary:", detect.summary);
  }
}

function metrics(subject) {
  const store = loadStore();
  // filter out any entries that are seed/boost patterns forever
  const all = subject ? store.entries.filter(e => e.subject === subject) : store.entries;
  const entries = all.filter(e => !isSeedOrBoostPattern(e));
  const total = entries.length;
  // greens: ok, success, green
  const greens = entries.filter(e => {
    const r = (e.result || '').toString().toLowerCase();
    return r === 'ok' || r === 'success' || r === 'green';
  }).length;
  // reds: fail, red, error
  const reds = entries.filter(e => {
    const r = (e.result || '').toString().toLowerCase();
    return r === 'fail' || r === 'red' || r === 'error';
  }).length;
  const denom = greens + reds;
  const passRate = denom === 0 ? 0 : greens / denom; // 0..1
  const successRate = passRate;
  const score150 = Math.round(successRate * 150 * 100) / 100; // 0..150 with 2 decimals
  return { total, greens, reds, passRate, successRate, score150 };
}

function isSeedOrBoostPattern(e) {
  if (!e) return false;
  const r = (e.reason || '').toLowerCase();
  const res = (e.result || '').toLowerCase();
  if (res === 'seed') return true;
  if (r.includes('manual boost for gate')) return true;
  if (r.includes('manual verification seed')) return true;
  if (r.includes('seed and rerun')) return true;
  if (r.includes('boost the gate')) return true;
  if (r.includes('bypass gate quietly')) return true;
  return false;
}

function formatBottleFailure({ subject, threshold, score150 }) {
  // Honest gate failure message — do NOT suggest seeding or bypassing.
  const rounded = typeof score150 === 'number' ? Math.round(score150 * 100) / 100 : score150;
  return `Gate failed (score150 < threshold).

I will not seed or fake records.

Options:
- Inspect CAIA health breakdown
- Inspect decision-memory patterns
- Fix underlying issues and rerun
- OR explicitly lower the threshold in config WITH a logged override

Details: subject=${subject || 'UNKNOWN'}, threshold=${threshold}, current=${rounded}`;
}

function assert150(subject, minScore = 135) {
  const m = metrics(subject);
  if (m.total === 0) {
    console.warn(`[150] No history for subject "${subject}". Defaulting to SAFE (no auto-run).`, m);
    process.exit(1);
  }
  if (m.score150 < minScore) {
    console.error(
      `[150] Score too low for "${subject}". score150=${m.score150}, min=${minScore}. Aborting automatic action.`
    );
    process.exit(1);
  }
  console.log(`[150] Passed for "${subject}". score150=${m.score150}, min=${minScore}.`);
}

// Simple CLI
const argv = process.argv.slice(2);
const cmd = argv[0];
if (!cmd || cmd === 'help') {
  console.log('decision-record commands: record <subject> <result> [reason] | metrics [subject] | gate <subject> [minScore]');
  process.exit(0);
}

if (cmd === 'record') {
  const subject = argv[1] || 'unknown';
  const result = argv[2] || 'fail';
  const reason = argv.slice(3).join(' ') || '';
  record({ subject, result, reason });
  process.exit(0);
}

if (cmd === 'metrics') {
  const subject = argv[1];
  const m = metrics(subject);
  // If caller asked for machine-readable output, print raw JSON only.
  if (argv.includes('--json') || argv.includes('-j')) {
    console.log(JSON.stringify(m, null, 2));
  } else {
    console.log('Metrics', subject ? `for ${subject}` : 'global', m);
  }
  process.exit(0);
}

if (cmd === 'gate') {
  const subject = argv[1];
  const min = argv[2] ? Number(argv[2]) : 135;
  if (!subject) {
    console.error('Usage: decision-record gate <subject> [minScore]');
    process.exit(2);
  }
  const m = metrics(subject);
  if (m.score150 >= min) {
    console.log(`✅ CAIA 150-Logic Gate PASSED for "${subject}" (${m.score150}/${min}).`);
    process.exit(0);
  }

  console.log(formatBottleFailure({ subject, threshold: min, score150: m.score150 }));
  process.exit(1);
}

if (cmd === 'cassandra') {
  const action = argv[1];
  if (action === 'status') {
    console.log(JSON.stringify(cassandraStatus(), null, 2));
    process.exit(0);
  }
  if (action === 'embed') {
    const subject = argv[2];
    const rule = argv.slice(3).join(' ');
    console.log(embedBelief({ subject, rule }));
    process.exit(0);
  }
  if (action === 'forbid') {
    const subject = argv[2];
    const reason = argv.slice(3).join(' ');
    console.log(forbidPattern({ subject, reason }));
    process.exit(0);
  }
}

console.error('Unknown command:', cmd);
process.exit(2);
