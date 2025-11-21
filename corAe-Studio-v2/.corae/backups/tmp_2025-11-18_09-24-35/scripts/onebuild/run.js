// ESM runner: applies manifest using safe-writer and logs

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';
import { safeWrite } from './safe-writer.js';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'build', 'one-build.manifest.yml');
const LOG_DIR = path.join(ROOT, 'build', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'one-build.log.jsonl');

async function appendLog(ev) {
  try { await fsp.mkdir(LOG_DIR, { recursive: true }); await fsp.appendFile(LOG_FILE, JSON.stringify(ev)+'\n','utf8'); } catch {}
}

async function main() {
  if (!fs.existsSync(MANIFEST)) { console.error('Missing build/one-build.manifest.yml'); process.exit(1); }
  const manifest = yaml.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const dryRun = process.env.ONEBUILD_DRY_RUN === '1';

  await appendLog({ ts:new Date().toISOString(), level:'INFO', scope:'onebuild', action:'START', notes:`version=${manifest.version}; dryRun=${dryRun}` });

  let wrote = 0, skipped = 0;
  for (const mod of manifest.modules || []) {
    for (const act of mod.actions || []) {
      for (const f of act.files || []) {
        const rel = f.path; const mode = f.mode || 'WRITE'; const content = f.content || '';
        try {
          if (dryRun) { 
            await appendLog({ ts:new Date().toISOString(), level:'INFO', scope:mod.key||'module', action:'DRY_RUN', file:rel, notes:`mode=${mode}` });
            skipped++; 
            continue; 
          }
          const res = await safeWrite(rel, content, mode);
          if (res.status === 'SKIPPED') skipped++; else wrote++;
        } catch (e) {
          await appendLog({ ts:new Date().toISOString(), level:'ERROR', scope:mod.key||'module', action:'WRITE_FAIL', file:rel, notes:e?.message||String(e) });
          throw e;
        }
      }
    }
  }
  await appendLog({ ts:new Date().toISOString(), level:'INFO', scope:'onebuild', action:'COMPLETE', notes:`wrote=${wrote}; skipped=${skipped}; dryRun=${dryRun}` });
  console.log(`One-Build complete. wrote=${wrote} skipped=${skipped} dryRun=${dryRun}`);
}
main().catch(async (e) => {
  await appendLog({ ts:new Date().toISOString(), level:'ERROR', scope:'onebuild', action:'ABORT', notes:e?.message||'Unknown error' });
  console.error(e); process.exit(1);
});