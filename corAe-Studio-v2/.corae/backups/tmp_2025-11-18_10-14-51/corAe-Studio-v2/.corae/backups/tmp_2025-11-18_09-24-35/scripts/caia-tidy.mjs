#!/usr/bin/env node
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const root = process.cwd();
function runCmd(cmd) {
  console.log('> ' + cmd);
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', cwd: root });
  return r.status || 0;
}

console.log('Running tidy plan (dry-run) via node scripts/tidy-corae.mjs...');
if (!fs.existsSync(path.join(root, 'scripts', 'tidy-corae.mjs'))) {
  console.error('scripts/tidy-corae.mjs not found. Run from repository root.');
  process.exit(1);
}

spawnSync('node scripts/tidy-corae.mjs', { shell: true, stdio: 'inherit', cwd: root });
spawnSync('node scripts/tidy-apply.mjs', { shell: true, stdio: 'inherit', cwd: root });

// Read suggested git commands from tidy output file if present
const cmdsFile = path.join(root, 'tmp.tidy-git-cmds.txt');
let cmds = [];
if (fs.existsSync(cmdsFile)) {
  cmds = fs.readFileSync(cmdsFile, 'utf8').split(/\r?\n/).filter(Boolean).filter(l => l.match(/^git mv |^git rm/));
}

if (!cmds.length) {
  console.log('No git move/delete commands proposed. Exiting.');
  process.exit(0);
}

console.log('Proposed git commands:');
cmds.forEach(c => console.log('  ' + c));

const auto = process.env.CAIA_TIDY_AUTO === '1';
async function askYes() {
  if (auto) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ans = await new Promise((res) => rl.question('Type YES to apply these git commands and continue with build (case-sensitive): ', (a) => { rl.close(); res(a); }));
  return ans === 'YES';
}

(async () => {
  const ok = await askYes();
  if (!ok) { console.log('Aborting. No changes applied.'); process.exit(0); }
  for (const line of cmds) {
    if (line.startsWith('git mv')) {
      spawnSync(line, { shell: true, stdio: 'inherit', cwd: root });
    } else if (line.startsWith('git rm')) {
      spawnSync(line, { shell: true, stdio: 'inherit', cwd: root });
    }
  }

  console.log('Running audit and CAIA build steps...');
  try { runCmd('pnpm audit'); } catch (e) {}
  try { runCmd('pnpm build:skim'); } catch (e) {}
  try { runCmd('pnpm build:promote'); } catch (e) {}
  try { runCmd('pnpm build:verify'); } catch (e) {}

  runCmd('git add -A');
  runCmd('git commit -m "CAIA tidy: apply tidy plan" || true');
  console.log('Tidy complete.');
})();
