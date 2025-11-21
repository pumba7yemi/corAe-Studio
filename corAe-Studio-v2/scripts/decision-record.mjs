#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  store.entries.push(entry);
  saveStore(store);
  console.log('Recorded decision entry:', entry.id);
}

function metrics(subject) {
  const store = loadStore();
  const entries = subject ? store.entries.filter(e => e.subject === subject) : store.entries;
  const total = entries.length;
  const failures = entries.filter(e => e.result !== 'ok' && e.result !== 'success').length;
  const success = total - failures;
  const successRate = total === 0 ? 1 : success / total; // 0..1
  const score150 = Math.round(successRate * 150 * 100) / 100; // 0..150 with 2 decimals
  return { total, failures, success, successRate, score150 };
}

// Simple CLI
const argv = process.argv.slice(2);
const cmd = argv[0];
if (!cmd || cmd === 'help') {
  console.log('decision-record commands: record <subject> <result> [reason] | metrics [subject]');
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
  console.log('Metrics', subject ? `for ${subject}` : 'global', m);
  process.exit(0);
}

console.error('Unknown command:', cmd);
process.exit(2);
