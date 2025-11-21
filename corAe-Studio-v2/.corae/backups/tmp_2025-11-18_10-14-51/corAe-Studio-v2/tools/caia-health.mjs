#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { routeIntent } from './structure-router.mjs';

const V2_ROOT = path.resolve(process.cwd());
const ROOT = path.resolve(V2_ROOT, '..');
const decisionStore = path.join(V2_ROOT, '.corae', 'decision-memory.json');
const cassandraStore = path.join(V2_ROOT, '.corae', 'cassandra-meta.json');
const decisionStoreAlt = path.join(ROOT, '.corae', 'decision-memory.json');
const cassandraStoreAlt = path.join(ROOT, '.corae', 'cassandra-meta.json');
const healthStore = path.join(V2_ROOT, '.corae', 'caia-health.json');

function safeReadJson(file, fallback = null) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

function readDecisionMetrics() {
  let store = safeReadJson(decisionStore, null);
  if (!store || !Array.isArray(store.entries) || store.entries.length === 0) {
    store = safeReadJson(decisionStoreAlt, { entries: [] });
  }
  const entries = Array.isArray(store?.entries) ? store.entries : [];
  const total = entries.length;
  const success = entries.filter(e => e.result === 'ok' || e.result === 'success').length;
  const failures = total - success;
  const successRate = total === 0 ? 0 : success / total;
  const score150 = Math.round(successRate * 150 * 100) / 100;
  return { total, success, failures, score150 };
}

function readCassandraStatus() {
  let store = safeReadJson(cassandraStore, null);
  if (!store || !Array.isArray(store.entries) || store.entries.length === 0) {
    store = safeReadJson(cassandraStoreAlt, { entries: [] });
  }
  const entries = Array.isArray(store?.entries) ? store.entries : [];
  const lastPatternId = entries.length ? Math.max(...entries.map(e => e.id || 0)) : null;
  const forbidden = safeReadJson(path.join(V2_ROOT, '.corae', 'forbidden-patterns.json'), null) || safeReadJson(path.join(ROOT, '.corae', 'forbidden-patterns.json'), { patterns: [] });
  const forbiddenCount = Array.isArray(forbidden?.patterns) ? forbidden.patterns.length : 0;
  const lastUpdated = entries.length ? entries[entries.length - 1].ts || null : null;
  return { forbiddenCount, lastPatternId, lastUpdated };
}

// Load any last-known-good JSON snapshots from the v2 .corae folder.
// Returns an object keyed by filename (without .json) -> parsed content.
function loadLastKnownGood() {
  const out = {};
  try {
    const base = path.join(V2_ROOT, '.corae');
    if (!fs.existsSync(base)) return out;
    const files = fs.readdirSync(base).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const full = path.join(base, file);
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        const key = file.replace(/\.json$/, '');
        out[key] = data;
      } catch (e) {
        // ignore malformed files
      }
    }
  } catch (e) {
    // ignore filesystem errors
  }
  return out;
}

function readLastNightly() {
  let store = safeReadJson(decisionStore, null);
  if (!store || !Array.isArray(store.entries) || store.entries.length === 0) {
    store = safeReadJson(decisionStoreAlt, { entries: [] });
  }
  const entries = Array.isArray(store?.entries) ? store.entries : [];
  const nightly = entries.filter(e => e.subject === 'nightly-sweep');
  if (!nightly.length) return { lastStart: null, lastResult: null, lastMessage: null };
  const lastStart = [...nightly].reverse().find(e => e.result === 'start') || null;
  const lastResult = [...nightly].reverse().find(e => e.result === 'success' || e.result === 'fail' || e.result === 'ok') || null;
  return {
    lastStart: lastStart ? lastStart.ts || null : null,
    lastResult: lastResult ? lastResult.result || null : null,
    lastMessage: lastResult ? lastResult.reason || null : null
  };
}

function computeHealth() {
  const metrics = readDecisionMetrics();
  const nightly = readLastNightly();
  const cass = readCassandraStatus();
  // load all last-known-good snapshots (non-blocking)
  const lastKnownGood = loadLastKnownGood();
  const score150 = metrics.score150 ?? 0;
  // SIL check — lightweight structural routing of a probe input
  let silProbe = { silMatch: false, silDomain: null, silCertainty: 0, silReason: '' };
  try {
    const r = routeIntent('repo structural status');
    silProbe = {
      silMatch: r.found || false,
      silDomain: r.targetDomain || null,
      silCertainty: r.certainty || 0,
      silReason: r.reason || ''
    };
  } catch (e) {
    // ignore
  }
  // Mood computation: combine pattern stability and success ratio
  // pattern stability: inverse of forbiddenCount normalized into 0..1
  const patternStability = (() => {
    try {
      const f = cass.forbiddenCount ?? 0;
      // If many forbidden patterns, stability lowers
      return Math.max(0, 1 - Math.min(f, 50) / 50);
    } catch (e) { return 1; }
  })();

  const moodScore150 = Math.round(((score150 / 150) * 0.6 + patternStability * 0.4) * 150 * 100) / 100;
  let mood = 'ATTENTIVE';
  if (moodScore150 >= 130) mood = 'CLEAR';
  else if (moodScore150 >= 110) mood = 'ATTENTIVE';
  else if (moodScore150 >= 90) mood = 'STRAINED';
  else mood = 'DEGRADED';

  let status = 'AMBER';
  if (score150 >= 135 && nightly.lastResult === 'success') status = 'GREEN';
  else if (score150 < 100 || nightly.lastResult === 'fail') status = 'RED';
  else status = 'AMBER';

  return {
    status,
    score150,
    lastNightly: nightly,
    cassandra: cass,
    mood: mood,
    moodScore150,
    sil: Object.assign({}, silProbe, {
      enforced: true,
      precedent: 'precedent-structure-duplication',
      warnsOnDuplicate: true
    }),
    build: {
      lastKnownGood
    },
    // systemBuilder awareness: read the last run snapshot(s) if present
    systemBuilder: (() => {
      try {
        // backward-compatible file
        const legacy = path.join(V2_ROOT, '.corae', 'system-builder-last.json');
        const sbFile = path.join(V2_ROOT, '.corae', 'system-builder-life-last.json');
        const fileToRead = fs.existsSync(sbFile) ? sbFile : (fs.existsSync(legacy) ? legacy : null);
        if (!fileToRead) return { status: 'never-run' };
        const data = JSON.parse(fs.readFileSync(fileToRead, 'utf8'));
        const plan = data?.plan || {};
        return {
          personSlug: plan.personSlug || plan.businessSlug || null,
          lastStatus: data?.result ? 'green' : 'clarify',
          lastHomeModules: Array.isArray(plan?.homeModules) ? plan.homeModules.length : 0,
          lastBusinessModules: Array.isArray(plan?.businessModules) ? plan.businessModules.length : 0,
          lastWorkModules: Array.isArray(plan?.workModules) ? plan.workModules.length : 0,
          spheres: plan?.spheres || [],
          ts: data?.ts || null
        };
      } catch (e) {
        return { status: 'error', error: String(e?.message || e) };
      }
    })(),
    // life-specific snapshot
    systemBuilderLife: (() => {
      try {
        const p = path.join(V2_ROOT, '.corae', 'system-builder-life-last.json');
        if (!fs.existsSync(p)) return { status: 'never-run' };
        const snap = JSON.parse(fs.readFileSync(p, 'utf8'));
        const plan = snap.plan || {};
        return {
          status: snap?.result ? 'green' : 'clarify',
          personSlug: plan.personSlug || null,
          spheres: plan.spheres || [],
          homeModules: (plan.homeModules || []).length,
          businessModules: (plan.businessModules || []).length,
          workModules: (plan.workModules || []).length,
          ts: snap.ts || null
        };
      } catch (e) { return { status: 'error', error: String(e?.message || e) }; }
    })(),
    // work view derived from same life snapshot (if present)
    systemBuilderWork: (() => {
      try {
        const p = path.join(V2_ROOT, '.corae', 'system-builder-life-last.json');
        if (!fs.existsSync(p)) return { status: 'never-run' };
        const snap = JSON.parse(fs.readFileSync(p, 'utf8'));
        const plan = snap.plan || {};
        const spheres = plan.spheres || [];
        if (!spheres.includes('work')) return { status: 'never-run' };
        return {
          status: snap?.result ? 'green' : 'clarify',
          personSlug: plan.personSlug || null,
          hasHome: spheres.includes('home'),
          hasBusiness: spheres.includes('business'),
          hasLife: spheres.includes('life-corridor'),
          workModules: (plan.workModules || []).length,
          ts: snap.ts || null
        };
      } catch (e) { return { status: 'error', error: String(e?.message || e) }; }
    })(),
    laws: Object.assign({}, (typeof (null) !== 'undefined' ? {} : {}), {
      greenConfidence: true
    }),
    generatedAt: new Date().toISOString()
  };
}

export function silCheck(input) {
  try {
    const r = routeIntent(input);
    return {
      silMatch: r.found,
      silDomain: r.targetDomain,
      silCertainty: r.certainty,
      silReason: r.reason
    };
  } catch (e) {
    return { silMatch: false, silDomain: null, silCertainty: 0, silReason: String(e?.message || e) };
  }
}

function saveHealthSnapshot(health) {
  try {
    const dir = path.join(V2_ROOT, '.corae');
    ensureDir(dir);
    fs.writeFileSync(healthStore, JSON.stringify(health, null, 2), 'utf8');
  } catch (e) {
    // ignore write errors
  }
}

function printStatus(health) {
  console.log(`CAIA HEALTH: ${health.status} (score150=${health.score150})`);
  console.log(JSON.stringify(health, null, 2));
}

function printJson(health) {
  console.log(JSON.stringify(health));
}

async function main() {
  const cmd = process.argv[2] || 'status';
  const health = computeHealth();
  saveHealthSnapshot(health);

  if (cmd === 'json') {
    printJson(health);
    process.exit(0);
  }

  if (cmd === 'check') {
    printStatus(health);
    if (health.status === 'GREEN') process.exit(0);
    if (health.status === 'AMBER') process.exit(1);
    process.exit(2);
  }

  // default: status
  printStatus(health);
  process.exit(0);
}

main();
