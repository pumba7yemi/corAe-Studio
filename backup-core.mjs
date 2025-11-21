#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
let archiver;
try {
  archiver = await import('archiver');
  archiver = archiver.default || archiver;
} catch (e) {
  archiver = null; // fallback to system zip
}

const VSC = process.cwd();
function nowStamp() {
  const d = new Date();
  return d.toISOString().replace(/[:]/g,'-').replace(/T/,'_').split('.')[0];
}

const outDir = path.join(VSC, 'corAe-Studio-v2', '.corae', 'backups');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `corAe_backup_${nowStamp()}.zip`);

const include = [
  path.join(VSC, 'corAe-Studio-v2', 'tools'),
  path.join(VSC, 'corAe-Studio-v2', 'persons'),
  path.join(VSC, 'corAe-Studio-v2', 'apps', 'life'),
  path.join(VSC, 'corAe-Studio-v2', 'apps', 'work'),
  path.join(VSC, 'corAe-Studio-v2', 'app', 'api', 'onboarding'),
  path.join(VSC, 'corAe-Studio-v2', '.corae'),
  path.join(VSC, 'scripts')
];

function exists(p) { try { return fs.existsSync(p); } catch(e){ return false; } }

async function run() {
  if (archiver) {
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      console.log(`Created ${outFile} (${archive.pointer()} bytes)`);
      console.log('Included paths:');
      include.forEach(p => { if (exists(p)) console.log('-', path.relative(VSC, p)); });
    });
    archive.on('error', err => { throw err; });
    archive.pipe(output);

    for (const p of include) {
      if (!exists(p)) continue;
      const base = path.relative(VSC, p);
      archive.directory(p, base);
    }

    await archive.finalize();
    return;
  }

  // Fallback: use system zip or PowerShell Compress-Archive
  console.log('archiver not found; using system zip fallback');
  const { spawnSync } = await import('node:child_process');
  if (process.platform === 'win32') {
    // Use PowerShell Compress-Archive
    const tmpDir = path.join(outDir, `tmp_${nowStamp()}`);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    for (const p of include) {
      if (!exists(p)) continue;
      const rel = path.relative(VSC, p);
      const dest = path.join(tmpDir, rel);
      if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), { recursive: true });
      // copy directory recursively
      spawnSync('powershell', ['-Command', `Copy-Item -Path '${p.replace(/'/g, "''")}' -Destination '${dest.replace(/'/g, "''")}' -Recurse -Force`], { stdio: 'inherit' });
    }
    spawnSync('powershell', ['-Command', `Compress-Archive -Path '${tmpDir}/*' -DestinationPath '${outFile}' -Force`], { stdio: 'inherit' });
    console.log(`Created ${outFile}`);
    // cleanup tmp
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch(e) {}
  } else {
    // unix: use zip if available
    const args = ['-r', outFile];
    for (const p of include) if (exists(p)) args.push(path.relative(VSC, p));
    const res = spawnSync('zip', args, { cwd: VSC, stdio: 'inherit' });
    if (res.status !== 0) throw new Error('zip failed');
    console.log(`Created ${outFile}`);
  }
}

run().catch(e => { console.error(e); process.exit(2); });
