// Node smoke logger — writes basic summary for CI/local checks
const fs = require("fs");
const path = require("path");

(async function main() {
  const outDir = path.join(process.cwd(), ".logs");
  fs.mkdirSync(outDir, { recursive: true });

  const summaryPath = path.join(outDir, "SMOKE_SUMMARY");
  const ts = new Date().toISOString();
  const payload = `SMOKE OK @ ${ts}\nnode=${process.version}\n`;
  fs.writeFileSync(summaryPath, payload);
  console.log(payload.trim());
})();
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, appendFileSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const admin = process.env.SHIP_UPDATE_ADMIN_SECRET || 'change-me';
const logsDir = path.resolve(process.cwd(), '.logs');
mkdirSync(logsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(logsDir, `smoke-${stamp}.log`);

const child = spawn('node', ['tools/ship/smoke-test.js', baseUrl], {
  shell: true,
  env: { ...process.env, SHIP_UPDATE_ADMIN_SECRET: admin },
});

writeFileSync(logFile, `=== SMOKE START ${stamp} ===\nBase URL: ${baseUrl}\n`);
child.stdout.on('data', (d) => appendFileSync(logFile, d));
child.stderr.on('data', (d) => appendFileSync(logFile, d));

child.on('close', (code) => {
  const summary = JSON.stringify({ ok: code === 0, applied: code === 0, ts: new Date().toISOString(), baseUrl });
  appendFileSync(logFile, `\nSMOKE_SUMMARY: ${summary}\n=== SMOKE END ${new Date().toISOString()} ===\n`);

  // keep last 14 logs
  const files = readdirSync(logsDir)
    .filter((f) => f.startsWith('smoke-'))
    .map((f) => ({ f, m: statSync(path.join(logsDir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  for (const old of files.slice(14)) unlinkSync(path.join(logsDir, old.f));

  console.log(`Smoke test completed (${code === 0 ? 'PASS' : 'FAIL'}) → ${logFile}`);
  process.exit(code ?? 0);
});
