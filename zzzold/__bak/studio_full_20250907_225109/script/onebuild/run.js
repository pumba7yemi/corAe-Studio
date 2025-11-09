// scripts/onebuild/run.js
/**
 * corAe One-Build Runner
 * ----------------------
 * - Append-only JSONL log at build/logs/one-build.log.jsonl
 * - Per-run snapshot under build/outputs/{runId}/repo/...
 * - checksums.json in both build/logs and build/outputs/{runId}
 * - run.json with full summary
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const yaml = require('yaml');
const { beginRun, endRun, add: logAdd } = require('./logger');

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, 'build');
const OUTPUTS_DIR = path.join(BUILD_DIR, 'outputs');
const LOGS_DIR = path.join(BUILD_DIR, 'logs');

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function safeRunId() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function writeFileWithMode(absPath, content, mode) {
  await ensureDir(path.dirname(absPath));

  if (mode === 'SKIP_IF_EXISTS' && fs.existsSync(absPath)) {
    return { status: 'SKIPPED', existed: true };
  }

  if (mode === 'APPEND' && fs.existsSync(absPath)) {
    await fsp.appendFile(absPath, '\n' + content, 'utf8');
    return { status: 'APPENDED', existed: true };
  }

  await fsp.writeFile(absPath, content, 'utf8');
  return { status: 'WRITTEN', existed: fs.existsSync(absPath) };
}

async function copyToSnapshot(runRepoDir, relPath, content) {
  const dest = path.join(runRepoDir, relPath);
  await ensureDir(path.dirname(dest));
  await fsp.writeFile(dest, content, 'utf8');
}

async function readOptional(p) {
  try {
    return await fsp.readFile(p, 'utf8');
  } catch {
    return null;
  }
}

async function main() {
  const manifestPath = path.join(BUILD_DIR, 'one-build.manifest.yml');
  const manifestRaw = await fsp.readFile(manifestPath, 'utf8');
  const manifest = yaml.parse(manifestRaw);

  const runId = process.env.ONEBUILD_TS || safeRunId();
  const runDir = path.join(OUTPUTS_DIR, runId);
  const runRepoDir = path.join(runDir, 'repo');
  await ensureDir(runRepoDir);
  await ensureDir(LOGS_DIR);

  await beginRun(runId, {
    manifestVersion: manifest.version,
    moduleCount: (manifest.modules || []).length,
    whiteLabelCount: (manifest.whiteLabels || []).length,
  });

  const results = [];
  const checksums = {};

  for (const mod of manifest.modules || []) {
    const modKey = mod.key || 'unknown.module';

    for (const act of mod.actions || []) {
      const actType = act.type || 'CODE';

      for (const file of act.files || []) {
        const relPath = file.path;
        const absPath = path.join(ROOT, relPath);
        const mode = file.mode || 'WRITE';
        const content = String(file.content ?? '');

        // Take pre-image (if exists)
        const preRaw = await readOptional(absPath);
        const preHash = preRaw != null ? sha256(preRaw) : null;

        // Write according to mode
        const writeRes = await writeFileWithMode(absPath, content, mode);

        // Post content + hash
        const finalRaw = await fsp.readFile(absPath, 'utf8');
        const postHash = sha256(finalRaw);

        // Mirror into snapshot
        await copyToSnapshot(runRepoDir, relPath, finalRaw);

        // Record checksums
        checksums[relPath] = postHash;

        const record = {
          runId,
          module: modKey,
          actionType: actType,
          file: relPath,
          mode,
          result: writeRes.status,
          preHash,
          postHash,
        };
        results.push(record);

        // Log event
        await logAdd({
          action: 'WRITE_FILE',
          scope: modKey,
          file: relPath,
          notes: `${writeRes.status} (${mode})`,
          meta: { preHash, postHash, actType },
        });

        // Optional postChecks from manifest
        if (Array.isArray(act.postChecks)) {
          for (const check of act.postChecks) {
            await logAdd({
              action: 'POST_CHECK',
              scope: modKey,
              file: relPath,
              notes: check,
              meta: { status: 'NOT_EVALUATED (hook only)' },
            });
          }
        }
      }
    }
  }

  // Write checksums to runDir and to /build/logs
  await ensureDir(runDir);
  await fsp.writeFile(
    path.join(runDir, 'checksums.json'),
    JSON.stringify(checksums, null, 2),
    'utf8'
  );
  await fsp.writeFile(
    path.join(LOGS_DIR, 'checksums.json'),
    JSON.stringify(checksums, null, 2),
    'utf8'
  );

  // Write run summary
  const runSummary = {
    runId,
    ts: new Date().toISOString(),
    manifest: {
      version: manifest.version,
      whiteLabels: (manifest.whiteLabels || []).map(w => ({ id: w.id, name: w.name })),
      moduleCount: (manifest.modules || []).length,
    },
    totals: {
      files: results.length,
      modules: new Set(results.map(r => r.module)).size,
    },
    results,
  };
  await fsp.writeFile(
    path.join(runDir, 'run.json'),
    JSON.stringify(runSummary, null, 2),
    'utf8'
  );

  // End run log
  await endRun(runId, {
    files: runSummary.totals.files,
    modules: runSummary.totals.modules,
    snapshotDir: path.relative(ROOT, runDir),
  });

  console.log(`✅ One-Build complete.
- Snapshot: build/outputs/${runId}/repo
- Checksums: build/outputs/${runId}/checksums.json & build/logs/checksums.json
- Log: build/logs/one-build.log.jsonl`);
}

main().catch(async (e) => {
  try {
    await logAdd({ level: 'ERROR', action: 'RUN_ERROR', notes: e?.message || String(e) });
  } catch {}
  console.error(e);
  process.exit(1);
});