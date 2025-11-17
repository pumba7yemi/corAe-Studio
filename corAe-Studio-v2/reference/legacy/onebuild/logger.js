// scripts/onebuild/logger.js
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'build', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'one-build.log.jsonl');
const LATEST_FILE = path.join(LOG_DIR, 'latest.txt');

async function ensure() {
  await fsp.mkdir(LOG_DIR, { recursive: true });
}

function nowISO() {
  return new Date().toISOString();
}

async function writeLine(obj) {
  await ensure();
  await fsp.appendFile(LOG_FILE, JSON.stringify(obj) + '\n', 'utf8');
}

async function add(event) {
  const payload = {
    ts: nowISO(),
    level: event.level || 'INFO',
    scope: event.scope || 'onebuild',
    action: event.action || 'NOTE',
    file: event.file,
    notes: event.notes,
    meta: event.meta || {},
  };
  await writeLine(payload);
  return payload;
}

async function beginRun(runId, manifestMeta = {}) {
  await ensure();
  await fsp.writeFile(LATEST_FILE, runId, 'utf8').catch(() => {});
  return add({
    action: 'RUN_BEGIN',
    notes: `Run ${runId} started`,
    meta: { runId, ...manifestMeta },
  });
}

async function endRun(runId, summary = {}) {
  return add({
    action: 'RUN_END',
    notes: `Run ${runId} finished`,
    meta: { runId, ...summary },
  });
}

module.exports = {
  add,
  beginRun,
  endRun,
  LOG_DIR,
  LOG_FILE,
  LATEST_FILE,
};