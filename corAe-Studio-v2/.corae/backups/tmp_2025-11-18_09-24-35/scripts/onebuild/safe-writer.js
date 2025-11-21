// ESM safe-writer: safe writes with backups + protected-path policy

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { minimatch } from 'minimatch'; // <-- named export

const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'build', 'logs');
const BACKUP_DIR = path.join(ROOT, 'build', 'backups');
const CHECKSUMS_FILE = path.join(LOG_DIR, 'checksums.json');
const PROTECT_MAIN = path.join(ROOT, 'build', 'safety', 'protected-paths.json');
const PROTECT_WL = path.join(ROOT, 'build', 'safety', 'white-label-protected.json');
const LOG_FILE = path.join(LOG_DIR, 'one-build.log.jsonl');

function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
async function ensure(...dirs) { await Promise.all(dirs.map(d => fsp.mkdir(d, { recursive: true }))); }
async function appendLog(ev) { try { await ensure(LOG_DIR); await fsp.appendFile(LOG_FILE, JSON.stringify(ev) + '\n', 'utf8'); } catch {} }

function loadPolicy() {
  let a = { paths: [], allowWriteIf: { mode: [] } };
  let b = { paths: [], allowWriteIf: { mode: [] } };
  try { a = JSON.parse(fs.readFileSync(PROTECT_MAIN, 'utf8')); } catch {}
  try { b = JSON.parse(fs.readFileSync(PROTECT_WL, 'utf8')); } catch {}
  const paths = [...(a.paths || []), ...(b.paths || [])];
  const allow = new Set([...(a.allowWriteIf?.mode || []), ...(b.allowWriteIf?.mode || [])]);
  return { paths, allowModes: [...allow] };
}
function isProtected(abs, patterns) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  return patterns.some(glob => minimatch(rel, glob, { dot: true }));
}

async function backupFile(absPath) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const rel = path.relative(ROOT, absPath);
  const dest = path.join(BACKUP_DIR, ts, rel);
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  try { const buf = await fsp.readFile(absPath); await fsp.writeFile(dest, buf); return dest; } catch { return null; }
}
async function readChecksums() { try { return JSON.parse(await fsp.readFile(CHECKSUMS_FILE, 'utf8')); } catch { return {}; } }
async function writeChecksums(map) { await ensure(LOG_DIR); await fsp.writeFile(CHECKSUMS_FILE, JSON.stringify(map, null, 2), 'utf8'); }

async function writeFileWithMode(abs, content, mode) {
  if (mode === 'APPEND' && fs.existsSync(abs)) await fsp.appendFile(abs, '\n' + content, 'utf8');
  else await fsp.writeFile(abs, content, 'utf8');
}

export async function safeWrite(relPath, content, mode = 'WRITE') {
  const abs = path.join(ROOT, relPath);
  const policy = loadPolicy();
  const exists = fs.existsSync(abs);

  if (isProtected(abs, policy.paths) && !policy.allowModes.includes(mode)) {
    await appendLog({ ts: new Date().toISOString(), level: 'WARN', scope: 'onebuild.safety', action: 'BLOCK_WRITE_PROTECTED', file: relPath, notes: `mode=${mode}` });
    throw new Error(`Protected path: ${relPath} (mode ${mode} not allowed)`);
  }

  if (mode === 'SKIP_IF_EXISTS' && exists) {
    await appendLog({ ts: new Date().toISOString(), level: 'INFO', scope: 'onebuild', action: 'SKIPPED', file: relPath });
    return { status: 'SKIPPED', file: relPath };
  }
  if (mode === 'ERROR_IF_EXISTS' && exists) {
    await appendLog({ ts: new Date().toISOString(), level: 'WARN', scope: 'onebuild', action: 'ERROR_IF_EXISTS', file: relPath });
    throw new Error(`File exists: ${relPath}`);
  }

  await fsp.mkdir(path.dirname(abs), { recursive: true });

  let finalContent = content;
  let backup = null;
  if (exists && (mode === 'WRITE' || mode === 'MERGE_JSON')) backup = await backupFile(abs);

  if (mode === 'MERGE_JSON') {
    const prev = exists ? await fsp.readFile(abs, 'utf8') : '{}';
    const a = prev ? JSON.parse(prev) : {};
    const b = content ? JSON.parse(content) : {};
    finalContent = JSON.stringify({ ...a, ...b, scripts: { ...(a.scripts || {}), ...(b.scripts || {}) } }, null, 2);
  }

  await writeFileWithMode(abs, finalContent, mode);
  const checksums = await readChecksums();
  const current = await fsp.readFile(abs, 'utf8').catch(() => finalContent);
  checksums[relPath] = sha256(current);
  await writeChecksums(checksums);

  await appendLog({ ts: new Date().toISOString(), level: 'INFO', scope: 'onebuild', action: 'WRITE_FILE', file: relPath, notes: `mode=${mode}${backup ? `; backup=${path.relative(ROOT, backup)}` : ''}` });
  return { status: 'WRITTEN', file: relPath, backup };
}