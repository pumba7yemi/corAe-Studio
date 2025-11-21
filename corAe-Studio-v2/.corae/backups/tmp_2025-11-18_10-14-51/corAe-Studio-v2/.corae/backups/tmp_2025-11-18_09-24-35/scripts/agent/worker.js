// ESM worker: watches queue and runs jobs; never writes files directly

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'build', '.data', 'agent');
const QUEUE_FILE = path.join(DATA_DIR, 'queue.jsonl');
const JOBS_DIR = path.join(DATA_DIR, 'jobs');
const LOGS_DIR = path.join(ROOT, 'build', 'logs');
const BUILD_LOG = path.join(LOGS_DIR, 'one-build.log.jsonl');

async function ensure() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(JOBS_DIR, { recursive: true });
  await fsp.mkdir(LOGS_DIR, { recursive: true });
  if (!fs.existsSync(QUEUE_FILE)) await fsp.writeFile(QUEUE_FILE, '', 'utf8');
}

async function appendEvent(ev) {
  try { await fsp.appendFile(BUILD_LOG, JSON.stringify(ev) + '\n', 'utf8'); } catch {}
}

function runNode(args, env) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, args, {
      cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...(env || {}) },
    });
    p.on('close', (code) => (code === 0 ? resolve(0) : reject(new Error(`node ${args.join(' ')} -> ${code}`))));
  });
}

async function readQueue() {
  const raw = await fsp.readFile(QUEUE_FILE, 'utf8').catch(() => '');
  return raw.split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
async function loadJob(id) {
  const raw = await fsp.readFile(path.join(JOBS_DIR, `${id}.json`), 'utf8');
  return JSON.parse(raw);
}
async function saveJob(job) {
  await fsp.writeFile(path.join(JOBS_DIR, `${job.id}.json`), JSON.stringify(job, null, 2), 'utf8');
}

async function getNextQueued() {
  const items = await readQueue();
  for (const j of items) {
    const p = path.join(JOBS_DIR, `${j.id}.json`);
    if (!fs.existsSync(p)) continue;
    const cur = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (cur.status === 'QUEUED') return cur;
  }
  return null;
}

// Optional periodic hook (will no-op if file not present)
async function processDueRecurrencesWrapper() {
  try {
    const modPath = path.join(ROOT, 'apps', 'studio', 'lib', 'obari', 'orders', 'order.js');
    if (fs.existsSync(modPath)) {
      const m = await import(pathToFileURL(modPath));
      if (m && typeof m.processDueRecurrences === 'function') {
        await m.processDueRecurrences(new Date().toISOString());
      }
    }
  } catch {}
}

async function processJob(job) {
  job.status = 'RUNNING';
  job.tsStarted = new Date().toISOString();
  await saveJob(job);
  await appendEvent({ ts: job.tsStarted, level: 'INFO', scope: 'agent', action: 'JOB_START', meta: { jobId: job.id, type: job.type } });

  try {
    if (job.type === 'ONEBUILD_RUN') {
      await runNode(['scripts/onebuild/validate.js']);
      await runNode(['scripts/onebuild/run.js']);
    } else if (job.type === 'ONEBUILD_DRY_RUN') {
      await runNode(['scripts/onebuild/validate.js']);
      await runNode(['scripts/onebuild/run.js'], { ONEBUILD_DRY_RUN: '1' });
    } else if (job.type === 'SHIP_APPLY_PRESET') {
      const shipDir = path.join(ROOT, 'build', '.data', 'ship');
      await fsp.mkdir(shipDir, { recursive: true });
      const cfg = {
        brandType: (job.payload && job.payload.brandType) || 'corae',
        brandName: (job.payload && job.payload.brandName) || '',
        vertical: (job.payload && job.payload.vertical) || 'supermarket',
        modules: (job.payload && job.payload.modules) || [],
        ts: new Date().toISOString()
      };
      await fsp.writeFile(path.join(shipDir, 'build.json'), JSON.stringify(cfg, null, 2), 'utf8');
      await appendEvent({ ts: new Date().toISOString(), level: 'INFO', scope: 'ship.build', action: 'APPLY_PRESET', notes: `${cfg.brandType} → ${cfg.vertical}`, meta: cfg });
    } else {
      throw new Error(`Unsupported job type: ${job.type}`);
    }

    job.status = 'DONE';
    job.tsFinished = new Date().toISOString();
    await saveJob(job);
    await appendEvent({ ts: job.tsFinished, level: 'INFO', scope: 'agent', action: 'JOB_DONE', meta: { jobId: job.id } });
  } catch (e) {
    job.status = 'ERROR';
    job.tsFinished = new Date().toISOString();
    job.error = e?.message || String(e);
    await saveJob(job);
    await appendEvent({ ts: job.tsFinished, level: 'ERROR', scope: 'agent', action: 'JOB_ERROR', notes: job.error, meta: { jobId: job.id } });
  }
}

async function main() {
  await ensure();
  await appendEvent({ ts: new Date().toISOString(), level: 'INFO', scope: 'agent', action: 'ONLINE' });
  console.log('Dev Agent (safe, ESM) online. Ctrl+C to stop.');

  let lastTick = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const job = await getNextQueued();
    if (job) {
      await processJob(job);
    } else {
      const now = Date.now();
      if (now - lastTick > 60_000) { await processDueRecurrencesWrapper(); lastTick = now; }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}
main();