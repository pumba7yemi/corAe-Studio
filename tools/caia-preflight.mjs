#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const root = process.cwd();
const ruleFile = path.join(root, '.corae', 'caia.rule.build.json');

function readRules() {
  if (!fs.existsSync(ruleFile)) return {};
  try {
    const raw = fs.readFileSync(ruleFile, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to read rule file:', e && e.message ? e.message : e);
    return {};
  }
}

function runCmd(cmd, opts = {}) {
  console.log('> ' + cmd);
  const res = spawnSync(cmd, { shell: true, stdio: 'inherit', cwd: opts.cwd || root, env: process.env });
  if (res.error) {
    console.error('Command failed to start:', res.error.message || res.error);
    return { code: 1 };
  }
  return { code: res.status === null ? 1 : res.status };
}

async function main() {
  const rules = readRules();
  const actions = (rules.actions && rules.actions.before) || [];
  if (!actions.length) {
    console.log('No preflight actions configured (actions.before is empty). Nothing to do.');
    process.exit(0);
  }

  for (const cmd of actions) {
    const r = runCmd(cmd);
    if (r.code !== 0) {
      console.error(`Preflight command failed (exit ${r.code}): ${cmd}`);
      process.exit(r.code || 1);
    }
  }

  console.log('Preflight completed successfully.');
  process.exit(0);
}

main();
#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execP = promisify(exec);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const studioRoot = path.resolve(scriptDir, '..');
process.chdir(studioRoot);

const rulePath = path.join(studioRoot, '.corae', 'caia.rule.build.json');

function normalizeCmd(cmd) {
  const trimmed = cmd.trim();
  if (trimmed === 'pnpm -w exec tsc -b --noEmit') {
    return 'pnpm -w exec tsc -b tsconfig.json --noEmit';
  }
  return cmd;
}

async function run() {
  let ruleText;
  try {
    ruleText = await fs.readFile(rulePath, 'utf8');
  } catch (e) {
    console.error(`Failed to read rule file at ${rulePath}:`, e.message || e);
    process.exit(2);
  }

  // Run CAIA Dev Gate in calm autopilot mode first. It may auto-decide without blocking.
  try {
    console.log('Running CAIA Dev Gate (calm/autopilot)...');
    await execP('node tools/caia-dev-gate.mjs --mode=auto', { cwd: studioRoot, maxBuffer: 20 * 1024 * 1024 });
    console.log('CAIA Dev Gate completed (auto).');
  } catch (e) {
    // If developer explicitly requested interactive mode, surface the failure.
    if (process.env.CAIA_DEV_MODE === 'true') {
      console.error('CAIA Dev Gate failed in interactive mode:', e.message || e);
      process.exit(e && typeof e.code === 'number' ? e.code : 1);
    }
    console.warn('CAIA Dev Gate reported issues; continuing in calm autopilot mode.');
  }

  let rule;
  try {
    rule = JSON.parse(ruleText);
  } catch (e) {
    console.error('Failed to parse JSON rule file:', e.message || e);
    process.exit(3);
  }

  const cmds = (rule.actions && Array.isArray(rule.actions.before)) ? rule.actions.before : [];
  if (!cmds.length) {
    console.log('No preflight commands to run.');
    process.exit(0);
  }

  console.log(`Running ${cmds.length} preflight commands from ${rulePath} (cwd=${process.cwd()})`);

  for (const raw of cmds) {
    const cmd = normalizeCmd(String(raw));
    console.log('> ' + cmd);
    try {
      const { stdout, stderr } = await execP(cmd, { cwd: studioRoot, maxBuffer: 20 * 1024 * 1024 });
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
    } catch (err) {
      const code = err && typeof err.code === 'number' ? err.code : 1;
      console.error('\nCommand failed:', cmd);
      if (err.stdout) process.stdout.write(err.stdout);
      if (err.stderr) process.stderr.write(err.stderr);
      console.error('\nExit code:', code);
      process.exit(code);
    }
  }

  console.log('PRE-FLIGHT OK');
  process.exit(0);
}

run();
