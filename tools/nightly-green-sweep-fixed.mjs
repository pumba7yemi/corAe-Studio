import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const ROOT = path.resolve(process.cwd());
const V2_ROOT = path.join(ROOT, 'corAe-Studio-v2');

function runStep(name, cmd, args, opts = {}) {
  const label = `Step: ${name}`;
  try {
    const res = spawnSync(cmd, args, { stdio: 'pipe', encoding: 'utf8', ...opts });
    const ok = res.status === 0;
    const mark = ok ? '✔' : '✖';
    console.log(`${mark} ${label} — ${cmd} ${args.join(' ')}`);
    if (res.stdout) console.log(res.stdout.trim());
    if (res.stderr && !ok) console.error(res.stderr.trim());
    return { code: res.status ?? 1, stdout: res.stdout, stderr: res.stderr };
  } catch (e) {
    console.error(`✖ ${label} — spawn failed:`, e);
    return { code: 1, stdout: '', stderr: String(e) };
  }
}

function decisionRecordPath() {
  const dr = path.join(V2_ROOT, 'tools', 'decision-record.mjs');
  return fs.existsSync(dr) ? dr : null;
}

async function main() {
  const dr = decisionRecordPath();

  if (dr) {
    runStep('record-start', 'node', [dr, 'record', 'nightly-sweep', 'start', 'Nightly green sweep starting'], { cwd: ROOT });
  } else {
    console.log('i Skipping decision-record start: not found at', path.join(V2_ROOT, 'tools', 'decision-record.mjs'));
  }

  console.log('Running build:verify...');
  const env = { ...process.env, CAIA_150_STRICT: 'true', CAIA_GATE_MIN: '140' };
  // Run with stdio: 'inherit' so output appears live in this process for debugging
  try {
    // Use the node executable directly to run the repo's build-verify script
    const spawned = spawnSync(process.execPath, ['scripts/build-verify.mts'], { cwd: ROOT, env, stdio: 'inherit' });
    if (spawned.error) {
      console.error('pnpm spawn error:', spawned.error && spawned.error.message ? spawned.error.message : spawned.error);
      var res = { code: spawned.error && spawned.error.code ? 1 : (spawned.status ?? 1) };
    } else {
      var res = { code: spawned.status ?? 1 };
    }
  } catch (e) {
    console.error('Failed to spawn pnpm build-verify:', e);
    var res = { code: 1 };
  }

  if (dr) {
    if (res.code === 0) {
      runStep('record-success', 'node', [dr, 'record', 'nightly-sweep', 'success', 'Nightly green sweep passed'], { cwd: ROOT });
    } else {
      runStep('record-fail', 'node', [dr, 'record', 'nightly-sweep', 'fail', `Nightly green sweep failed with exit code ${res.code}`], { cwd: ROOT });
    }
  } else {
    console.log('i Skipping decision-record result: not found');
  }

  process.exit(res.code ?? 1);
}

main();
