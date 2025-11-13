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
