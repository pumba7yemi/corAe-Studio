#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import child_process from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'tools', 'shipyard', 'out');
const PLAN_PATH = path.join(OUT_DIR, 'plan.json');

function safeReadPlan(): any {
  if (!fs.existsSync(PLAN_PATH)) {
    console.error(`Plan not found at ${PLAN_PATH}. Run the scanner first (scan:yard).`);
    process.exit(1);
  }
  try {
    const raw = fs.readFileSync(PLAN_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse plan.json:', e);
    process.exit(1);
  }
}

function exec(cmd: string) {
  return child_process.execSync(cmd, { stdio: 'inherit' });
}

function quote(p: string) {
  return `"${p.replace(/"/g, '\\"')}"`;
}

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function writeDryRunReport(report: any) {
  ensureOutDir();
  const outFile = path.join(OUT_DIR, 'dry-run-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Dry-run report written to: ${path.relative(ROOT, outFile)}`);
}

function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes('--apply');
  const yes = argv.includes('--yes');
  const branchArg = argv.find((a) => a.startsWith('--branch='));
  const branch = branchArg ? branchArg.split('=')[1] : `chore/shipyard-tidy-${Date.now()}`;

  const plan = safeReadPlan();
  const moves: { from: string; to: string; reason: string }[] = plan.suggestedMoves || [];
  const deletes: { target: string; reason: string }[] = plan.suggestedDeletes || [];

  console.log('\nPlan summary:');
  console.log(`  suggestedMoves: ${moves.length}`);
  console.log(`  suggestedDeletes: ${deletes.length}`);
  console.log(`  duplicates: ${plan.duplicates?.length ?? 0}`);
  console.log(`  nearDuplicates: ${plan.nearDuplicates?.length ?? 0}`);
  console.log(`  orphans: ${plan.orphans?.length ?? 0}`);
  console.log('');

  if (!apply) {
    console.log('DRY RUN — the following git commands WOULD be executed:');
    for (const m of moves) {
      console.log(`  git mv ${quote(m.from)} ${quote(m.to)}  # ${m.reason}`);
    }
    for (const d of deletes) {
      console.log(`  git rm ${quote(d.target)}  # ${d.reason}`);
    }

    const report = { generatedAt: new Date().toISOString(), moves, deletes, note: 'dry-run' };
    writeDryRunReport(report);
    console.log('\nTo apply these changes run: node tools/shipyard/apply-plan.ts --apply --yes');
    process.exit(0);
  }

  // Apply mode
  if (!fs.existsSync(path.join(ROOT, '.git'))) {
    console.error('No .git repository detected at project root. Aborting apply.');
    process.exit(1);
  }

  if (!yes) {
    console.error('Refusing to apply without explicit --yes flag. Re-run with --apply --yes to proceed.');
    process.exit(2);
  }

  try {
    console.log(`Creating branch ${branch}...`);
    exec(`git checkout -b ${branch}`);
  } catch (e) {
    console.error('Failed to create branch. Aborting.');
    process.exit(1);
  }

  // Perform moves
  for (const m of moves) {
    const from = path.join(ROOT, m.from);
    const to = path.join(ROOT, m.to);
    const toDir = path.dirname(to);
    try {
      fs.mkdirSync(toDir, { recursive: true });
      console.log(`git mv ${m.from} -> ${m.to}`);
      exec(`git mv ${quote(m.from)} ${quote(m.to)}`);
    } catch (e: any) {
      console.error(`Failed to move ${m.from} -> ${m.to}:`, e?.message ?? e);
    }
  }

  // Perform deletes
  for (const d of deletes) {
    try {
      console.log(`git rm ${d.target}`);
      exec(`git rm ${quote(d.target)}`);
    } catch (e: any) {
      console.error(`Failed to delete ${d.target}:`, e?.message ?? e);
    }
  }

  try {
    exec(`git add -A`);
    exec(`git commit -m "chore(shipyard): apply plan from tools/shipyard/out/plan.json"`);
    const rev = child_process.execSync('git rev-parse --short HEAD').toString().trim();
    const reportMd = `# Shipyard Tidy Migration Report\n\nBranch: ${branch}\nCommit: ${rev}\nAppliedAt: ${new Date().toISOString()}\n\nMoves:\n${moves
      .map((m) => `- ${m.from} -> ${m.to}  # ${m.reason}`)
      .join('\n')}\n\nDeletes:\n${deletes.map((d) => `- ${d.target}  # ${d.reason}`).join('\n')}\n`;
    const reportPath = path.join(OUT_DIR, 'migration-report.md');
    fs.writeFileSync(reportPath, reportMd, 'utf8');
    console.log(`\nApplied changes and wrote migration report to ${path.relative(ROOT, reportPath)}`);
  } catch (e: any) {
    console.error('Failed to commit/apply changes:', e?.message ?? e);
    process.exit(1);
  }
}

main();
