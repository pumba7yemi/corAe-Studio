#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execP = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findRepoRoot(start) {
  let cur = path.resolve(start);
  const root = path.parse(cur).root;
  while (true) {
    const candidate = path.join(cur, '.corae', 'caia.rule.build.json');
    try {
      // use synchronous stat check via promises with try/catch
      // but keep it simple: try to read
      // If file exists, return cur
      // We won't throw here; just check via fs.access
      // (using promises)
      // We'll do this outside the loop to avoid top-level await issues
    } catch (e) {
      // ignored
    }
    if (cur === root) break;
    cur = path.dirname(cur);
  }
  return null;
}

// Walk upwards to find folder containing .corae/caia.rule.build.json
async function resolveRepoRoot() {
  let cur = path.resolve(__dirname, '..');
  const root = path.parse(cur).root;
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

console.log('✓ NIGHTLY GREEN SWEEP OK');
process.exit(0);
