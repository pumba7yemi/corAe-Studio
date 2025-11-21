#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

// This script is intended to be run from the corAe-Studio-v2 working directory
const baseDir = process.cwd();

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

const targets = [
  'tools',
  'persons',
  'apps/life',
  'apps/work',
  'app/api/onboarding',
  '.corae',
  'scripts'
];

function exists(rel) { return fs.existsSync(path.join(baseDir, rel)); }

const outDir = path.join(baseDir, '.corae', 'backups');
fs.mkdirSync(outDir, { recursive: true });

const name = `corAe_backup_${timestamp()}.zip`;
const outPath = path.join(outDir, name);

const toZip = [];
for (const t of targets) {
  if (!exists(t)) continue;
  if (t === '.corae') {
    const d = path.join(baseDir, t);
    for (const f of fs.readdirSync(d)) {
      if (f === 'backups') continue;
      toZip.push(path.join(t, f));
    }
  } else {
    toZip.push(t);
  }
}

if (toZip.length === 0) {
  console.error('No allowed folders found to include. Nothing to backup.');
  process.exit(1);
}

try {
  if (process.platform === 'win32') {
    const tmpDir = path.join(baseDir, `.tmp_backup_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    for (const rel of toZip) {
      const src = path.join(baseDir, rel);
      if (!fs.existsSync(src)) continue;
      const dest = path.join(tmpDir, rel.replace(/\//g, path.sep));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      try {
        child_process.execSync(`robocopy "${src}" "${dest}" /E /NFL /NDL /NJH /NJS`, { stdio: 'ignore' });
      } catch (e) {
        const cp = (s, d) => {
          if (fs.statSync(s).isDirectory()) {
            fs.mkdirSync(d, { recursive: true });
            for (const f of fs.readdirSync(s)) cp(path.join(s,f), path.join(d,f));
          } else {
            fs.copyFileSync(s, d);
          }
        };
        cp(src, dest);
      }
    }
    const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${tmpDir}\\*' -DestinationPath '${outPath}' -Force"`;
    child_process.execSync(psCmd, { stdio: 'inherit' });
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } else {
    const zipArgs = ['-r', outPath, ...toZip];
    child_process.execFileSync('zip', zipArgs, { cwd: baseDir, stdio: 'inherit' });
  }

  console.log('\nBackup created:', outPath);
  console.log('\nContents:');
  if (process.platform === 'win32') {
    child_process.execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${outPath}' -DestinationPath '${outDir}\\_inspect' -Force; Get-ChildItem -Recurse '${outDir}\\_inspect' | Select-Object FullName | Out-String"`, { stdio: 'inherit' });
    fs.rmSync(path.join(outDir, '_inspect'), { recursive: true, force: true });
  } else {
    child_process.execFileSync('unzip', ['-l', outPath], { stdio: 'inherit' });
  }
  process.exit(0);
} catch (err) {
  console.error('Backup failed:', err);
  process.exit(2);
}
