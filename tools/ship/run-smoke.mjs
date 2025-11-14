#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const logDir = path.join(root, '.logs');
try { fs.mkdirSync(logDir, { recursive: true }); } catch (e) {}
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(logDir, `smoke-${stamp}.log`);

const BaseUrl = process.argv[2] || 'http://127.0.0.1:3000';
const AdminSecret = process.argv[3] || 'change-me';

process.env.SHIP_UPDATE_ADMIN_SECRET = AdminSecret;

const cmd = `node "${path.join(root, 'tools', 'ship', 'smoke-test.js')}" ${BaseUrl}`;
console.log('Running smoke test:', cmd);
const res = spawnSync(cmd, { shell: true, cwd: root, encoding: 'utf8' });
const out = `=== SMOKE START ${new Date().toISOString()} ===\n${res.stdout || ''}\n${res.stderr || ''}\n=== SMOKE END ${new Date().toISOString()} ===\n`;
fs.writeFileSync(logPath, out, 'utf8');

const summary = {
  ok: res.status === 0,
  applied: true,
  ts: new Date().toISOString(),
  baseUrl: BaseUrl
};
fs.appendFileSync(logPath, `SMOKE_SUMMARY: ${JSON.stringify(summary)}\n`, 'utf8');

// Keep last 14 logs
try {
  const files = fs.readdirSync(logDir).filter((f) => f.startsWith('smoke-')).map((f) => ({ f, t: fs.statSync(path.join(logDir,f)).mtimeMs })).sort((a,b)=>b.t-a.t);
  for (let i = 14; i < files.length; i++) fs.rmSync(path.join(logDir, files[i].f));
} catch (e) {}

process.exit(res.status || 0);
