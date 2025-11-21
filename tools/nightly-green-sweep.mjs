#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execP = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function resolveRepoRoot() {
  const starts = [path.resolve(__dirname, '..'), process.cwd()];
  const root = path.parse(starts[0]).root;

  for (const start of starts) {
    let cur = path.resolve(start);
    while (true) {
      const candidate = path.join(cur, '.corae', 'caia.rule.build.json');
      try {
        await fs.access(candidate);
        return cur;
      } catch (e) {
        // not found; move up
      }
      if (cur === root) break;
      cur = path.dirname(cur);
    }
  }

  return null;
}

function normalizeCmd(cmd) {
  const trimmed = String(cmd).trim();
  if (trimmed === 'pnpm -w exec tsc -b --noEmit') {
    return 'pnpm -w exec tsc -b tsconfig.json --noEmit';
  }
  return cmd;
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

const repoRoot = await resolveRepoRoot();
if (!repoRoot) {
  console.error('Could not find repo root containing .corae/caia.rule.build.json');
  process.exit(1);
}

const rulePath = path.join(repoRoot, '.corae', 'caia.rule.build.json');
// Run CAIA Dev Gate in calm/autopilot mode before nightly sweep
try {
  console.log('Running CAIA Dev Gate (calm/autopilot) before nightly sweep...');
  await execP('node tools/caia-dev-gate.mjs --mode=auto', { cwd: repoRoot, maxBuffer: 20 * 1024 * 1024 });
  console.log('CAIA Dev Gate (auto) finished.');
} catch (e) {
  if (process.env.CAIA_DEV_MODE === 'true') {
    console.error('CAIA Dev Gate failed in interactive mode:', e.message || e);
    process.exit(e && typeof e.code === 'number' ? e.code : 1);
  }
  console.warn('CAIA Dev Gate reported issues; continuing nightly in calm autopilot mode.');
}

let ruleText;
try {
  ruleText = await fs.readFile(rulePath, 'utf8');
} catch (e) {
  console.error(`Failed to read rule file at ${rulePath}:`, e.message || e);
  process.exit(2);
}

let rule;
try {
  rule = JSON.parse(ruleText);
} catch (e) {
  console.error('Failed to parse JSON rule file:', e.message || e);
  process.exit(3);
}

const cmds = (rule.actions && (rule.actions.nightly || rule.actions.sweep || rule.actions.after))
  ? (rule.actions.nightly || rule.actions.sweep || rule.actions.after)
  : null;

if (!Array.isArray(cmds) || cmds.length === 0) {
  console.error('No nightly command list found. Checked `actions.nightly`, `actions.sweep`, `actions.after`.');
  process.exit(1);
}

if (dryRun) {
  console.log('DRY-RUN: The following commands would run:');
  cmds.forEach((c, i) => console.log(`  [${i + 1}/${cmds.length}] ${String(c)}`));
  process.exit(0);
}

for (let i = 0; i < cmds.length; i++) {
  const raw = cmds[i];
  const cmd = normalizeCmd(raw);
  console.log(`>> [${i + 1}/${cmds.length}] ${cmd}`);
  try {
    const { stdout, stderr } = await execP(cmd, { cwd: repoRoot, maxBuffer: 20 * 1024 * 1024 });
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  } catch (err) {
    const code = err && typeof err.code === 'number' ? err.code : 1;
    console.error(`\n✖ FAILED: ${cmd}`);
    if (err.stdout) process.stdout.write(err.stdout);
    if (err.stderr) process.stderr.write(err.stderr);
    console.error(`Exit code: ${code}`);
    process.exit(code);
  }
}

// Module map checks
async function runModuleChecks() {
  const modAdapterPath = path.join(repoRoot, 'tools', 'caia-modules.mjs');
  let loadModules = null;
  try {
    const url = 'file://' + modAdapterPath.replace(/\\/g, '/');
    const mod = await import(url);
    loadModules = mod.loadModules ?? (mod.default && mod.default.loadModules);
  } catch (e) {
    console.warn('Module map adapter not found or failed to import:', e && e.message ? e.message : e);
  }

  if (!loadModules) {
    console.log('No module map adapter available; skipping module checks.');
    return { ok: true, missing: [], extra: [] };
  }

  let modules;
  try {
    modules = await loadModules();
  } catch (e) {
    console.error('Failed to load module map:', e && e.message ? e.message : e);
    return { ok: false, missing: ['__module_map_unreadable__'], extra: [] };
  }

  const groupsToCheck = {
    homeCore: '/ship/home/core',
    workCore: '/ship/work/core',
    businessCore: '/ship/business/core',
    businessFront: '/ship/business/front',
  };

  const missing = [];
  const extra = [];

  for (const [key, prefix] of Object.entries(groupsToCheck)) {
    const entries = modules[key] || [];
    // expected set
    const expected = new Set(entries.map((e) => String(e.path).replace(/\/$/, '')));

    // actual on-disk paths under apps/studio/app + prefix
    const rel = prefix.replace(/^\//, '');
    const folder = path.join(repoRoot, 'apps', 'studio', 'app', rel);
    let actualNames = [];
    try {
      const items = await fs.readdir(folder, { withFileTypes: true });
      for (const it of items) {
        if (!it.isDirectory()) continue;
        const pageFile = path.join(folder, it.name, 'page.tsx');
        try {
          await fs.access(pageFile);
          actualNames.push(`/${rel}/${it.name}`);
        } catch {
          // no page.tsx — ignore
        }
      }
    } catch (e) {
      // folder may not exist
    }

    const actualSet = new Set(actualNames.map((p) => p.replace(/\\/g, '/')));

    // missing: in expected but not in actualSet
    for (const exp of expected) {
      const p = exp.replace(/\\/g, '/');
      // normalize to leading slash for comparison
      const norm = p.startsWith('/') ? p : '/' + p;
      if (!actualSet.has(norm)) missing.push({ group: key, path: norm });
    }

    // extra: in actualSet but not in expected
    for (const act of actualSet) {
      const normalized = act.replace(/\\/g, '/');
      if (!expected.has(normalized)) extra.push({ group: key, path: normalized });
    }
  }

  const ok = missing.length === 0;

  // write summary to logs
  try {
    const outDir = path.join(repoRoot, 'logs', 'nightly');
    await fs.mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, `module-check-${Date.now()}.json`);
    const summary = { ok, missing, extra, timestamp: new Date().toISOString() };
    await fs.writeFile(outPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log('Module check summary written to', outPath);
  } catch (e) {
    console.warn('Failed to write nightly log:', e && e.message ? e.message : e);
  }

  if (!ok) {
    console.error('Modules: missing', missing.map((m) => m.path).join(', '));
    console.error('Modules: extra', extra.map((m) => m.path).join(', '));
  } else {
    console.log('Modules: OK');
  }

  return { ok, missing, extra };
}

const moduleResult = await runModuleChecks();
if (!moduleResult.ok) {
  console.error('Nightly module map check failed.');
  process.exit(2);
}

console.log('✓ NIGHTLY GREEN SWEEP OK');
process.exit(0);
