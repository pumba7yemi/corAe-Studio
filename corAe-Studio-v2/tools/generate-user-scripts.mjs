#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function safeMkdir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf-8');
}

function writeText(file, txt) {
  fs.writeFileSync(file, txt, 'utf-8');
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: generate-user-scripts.mjs <slug>');
    process.exit(2);
  }

  const base = path.join(process.cwd(), 'persons', slug);
  const profilePath = path.join(base, 'profile.json');
  if (!fs.existsSync(profilePath)) {
    console.error('profile.json not found for', slug);
    process.exit(1);
  }

  const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));

  // Determine spheres
  const spheres = ['home', 'work', 'business'];

  for (const s of spheres) {
    const dir = path.join(base, 'scripts', s);
    safeMkdir(dir);

    // daily CAIA script
    const daily = `# Daily CAIA Script for ${profile.name || slug} — ${s}\n\n- Morning check-in\n- Top priorities for ${s}\n- Do the most important thing\n`;
    writeText(path.join(dir, 'daily.md'), daily);

    // have-you logic (simple JSON stub)
    const haveYou = { version: 1, sphere: s, checks: ["greeted-today", "tasks-reviewed"], created: new Date().toISOString() };
    writeJson(path.join(dir, 'have-you.json'), haveYou);

    // alignment checker
    const alignment = { version: 1, sphere: s, alignmentScore: 100, notes: ["auto-generated alignment"] };
    writeJson(path.join(dir, 'alignment.json'), alignment);

    // corridor-transition rule stub if profile missing sphere info
    if (!profile.spheres || !(profile.spheres.includes && profile.spheres.includes(s))) {
      const rule = { rule: 'corridor-transition', sphere: s, action: `notify: consider adding ${s} to profile` };
      writeJson(path.join(dir, 'corridor-transition.json'), rule);
    }
  }

  // Log decision-record for onboarding-build
  try {
    const dr = path.join(process.cwd(), 'tools', 'decision-record.mjs');
    if (fs.existsSync(dr)) {
      const { spawnSync } = await import('child_process');
      spawnSync(process.execPath, [dr, 'record', 'onboarding-build', 'green', `scripts generated for ${slug}`], { cwd: process.cwd(), stdio: 'ignore' });
    }
  } catch (e) { /* swallow */ }

  console.log('generated scripts for', slug);
}

main().catch((e) => { console.error(e); process.exit(1); });
