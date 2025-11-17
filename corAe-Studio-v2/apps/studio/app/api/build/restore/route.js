// Self-contained Restore API: no external imports from lib/build/log.
// Restores a file from build/backups/<timestamp>/<filePath>,
// snapshots the current file first (so it’s reversible),
// updates build/logs/checksums.json, and appends to build/logs/one-build.log.jsonl.

import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import fssync from 'node:fs';
import crypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ----- local logging helpers (no external deps) -----
const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'build', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'one-build.log.jsonl');
const CHECKSUMS_FILE = path.join(LOG_DIR, 'checksums.json');
const BACKUPS_DIR = path.join(ROOT, 'build', 'backups');

async function ensureLogDir() {
  await fs.mkdir(LOG_DIR, { recursive: true });
}
async function logEventLocal(ev) {
  try {
    await ensureLogDir();
    const line = JSON.stringify(ev) + '\n';
    await fs.appendFile(LOG_FILE, line, 'utf8');
  } catch { /* swallow logging errors */ }
}
async function readChecksums() {
  try {
    const raw = await fs.readFile(CHECKSUMS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
async function writeChecksums(map) {
  await ensureLogDir();
  await fs.writeFile(CHECKSUMS_FILE, JSON.stringify(map, null, 2), 'utf8');
}
function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
// ----------------------------------------------------

export async function POST(req) {
  try {
    const { timestamp, filePath } = await req.json();

    if (!timestamp || !filePath) {
      return NextResponse.json(
        { ok: false, error: 'Missing timestamp or filePath' },
        { status: 400 }
      );
    }

    const src = path.join(BACKUPS_DIR, timestamp, filePath);
    const dest = path.join(ROOT, filePath);

    if (!fssync.existsSync(src)) {
      return NextResponse.json(
        { ok: false, error: `Backup not found: ${path.relative(ROOT, src)}` },
        { status: 404 }
      );
    }

    // Read backup
    const backupBuf = await fs.readFile(src);
    const backupContent = backupBuf.toString('utf8');
    if (!backupContent) {
      return NextResponse.json(
        { ok: false, error: 'Backup content is empty' },
        { status: 409 }
      );
    }
    const backupHash = sha256(backupContent);

    // Pre-restore snapshot (reversible)
    const nowTs = new Date().toISOString().replace(/[:.]/g, '-');
    const preSnap = path.join(BACKUPS_DIR, nowTs, filePath);
    try {
      if (fssync.existsSync(dest)) {
        const current = await fs.readFile(dest);
        await fs.mkdir(path.dirname(preSnap), { recursive: true });
        await fs.writeFile(preSnap, current);
      }
    } catch { /* best-effort */ }

    // Restore
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, backupContent, 'utf8');

    // Update checksums
    const sums = await readChecksums();
    sums[filePath] = backupHash;
    await writeChecksums(sums);

    // Log success
    await logEventLocal({
      ts: new Date().toISOString(),
      level: 'INFO',
      scope: 'onebuild.restore',
      action: 'RESTORE_FILE',
      file: filePath,
      notes: `from backup ${timestamp}${fssync.existsSync(preSnap) ? `; preSnapshot=${path.relative(ROOT, preSnap)}` : ''}`,
      meta: { timestamp, src: path.relative(ROOT, src), backupHash }
    });

    return NextResponse.json({ ok: true, restored: filePath, from: timestamp });
  } catch (e) {
    await logEventLocal({
      ts: new Date().toISOString(),
      level: 'ERROR',
      scope: 'onebuild.restore',
      action: 'RESTORE_FAIL',
      notes: e?.message || 'Restore failed'
    });
    return NextResponse.json(
      { ok: false, error: e?.message || 'Restore failed' },
      { status: 500 }
    );
  }
}