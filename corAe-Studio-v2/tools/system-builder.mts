import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export type OnboardingSphere = 'home' | 'business' | 'work' | 'mixed';

export type OnboardingPayload = {
  subjectId: string;
  name: string;
  email?: string;
  location?: string;
  sphere?: OnboardingSphere;
  lifeStage?: string;
  faithPractice?: string;
  stressPoints?: string[];
  goals?: string[];
  businessType?: string;
  verticals?: string[];
  staffCount?: number;
  roleTitle?: string;
  employerName?: string;
  rawAnswers?: any;
};

export type BuildSphere = 'home' | 'work' | 'business' | 'life-corridor';

export type BuildPlan = {
  id: string;
  subjectId: string;
  personSlug: string;
  spheres: BuildSphere[];
  homeModules: string[];
  businessModules: string[];
  workModules: string[];
  corridorModules: string[];
  createdAt: string;
  silDomain: string | null;
  silConfidence: number;
  reason: string;
};

export type BuildResult = {
  plan: BuildPlan;
  root: string;
  createdFiles: string[];
  haveYouHomePath?: string;
  haveYouBusinessPath?: string;
  haveYouWorkPath?: string;
  caiaHomeScriptsPath?: string;
  caiaBusinessScriptsPath?: string;
  caiaWorkScriptsPath?: string;
};

import { routeIntent } from './structure-router.mjs';

function kebab(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, '')
    .trim()
    .replace(/\\s+/g, '-');
}

function ensureDir(dir: string) {
  try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch (e) { }
}

export function planFromOnboarding(input: OnboardingPayload): BuildPlan {
  const combined = [input.sphere || '', input.businessType || '', input.lifeStage || '', input.roleTitle || '', input.name || ''].join(' ');
  const sil = routeIntent(combined || (input.name || 'generic'));
  const silDomain = sil.targetDomain || 'unknown';
  const silConfidence = Number(sil.certainty ?? 0);

  // determine spheres
  let spheres: BuildSphere[] = [];
  const hasBusinessInfo = Boolean(input.businessType || (input.verticals && input.verticals.length) || input.employerName);
  const explicitSphere = input.sphere || null;
  const implicitWorkOnly = !explicitSphere && input.roleTitle && !input.businessType && !(input.verticals && input.verticals.length);

  if (explicitSphere === 'home') spheres = ['home','life-corridor'];
  else if (explicitSphere === 'business') spheres = ['business','work','life-corridor'];
  else if (explicitSphere === 'work' || implicitWorkOnly) spheres = ['work','life-corridor'];
  else if (explicitSphere === 'mixed') spheres = ['home','business','work','life-corridor'];
  else {
    // heuristics
    if (hasBusinessInfo && (input.lifeStage || input.name)) spheres = ['home','business','work','life-corridor'];
    else if (hasBusinessInfo) spheres = ['business','work','life-corridor'];
    else spheres = ['home','life-corridor'];
  }

  // modules
  const homeModules: string[] = [];
  if (spheres.includes('home')) {
    homeModules.push('home.core','home.health','home.money','home.unwind','home.care','home.style');
    if (input.faithPractice) homeModules.push('home.faith');
    if ((input.lifeStage || '').toLowerCase().includes('child')) homeModules.push('home.childcare');
  }

  const businessModules: string[] = [];
  if (spheres.includes('business')) {
    businessModules.push('core.management','core.legal','core.hr','care.finance','care.operations');
    const domain = silDomain || '';
    if (domain.includes('clean')) businessModules.push('vertical.cleaning');
    else if (domain.includes('salon') || domain.includes('beauty')) businessModules.push('vertical.salon');
    else if (domain.includes('supermarket') || domain.includes('retail')) businessModules.push('vertical.supermarket');
    else businessModules.push('vertical.generic-service');
  }

  const workModules: string[] = [];
  if (spheres.includes('work')) {
    workModules.push('work.3x3dtd','work.focus','work.caia-desk','work.cims','work.caia-checkin');
    if (input.roleTitle) workModules.push('work.role-profile');
    if (!input.businessType && !input.employerName) workModules.push('work.free-agent');
  }

  const corridorModules = ['life.corridor','life.mood','life.timeline','life.journal'];

  const plan: BuildPlan = {
    id: `sb-${Date.now()}`,
    subjectId: input.subjectId || 'unknown',
    personSlug: kebab((input.name || 'person') + '-' + (input.subjectId || Date.now())),
    spheres,
    homeModules: silConfidence < 0.45 ? [] : homeModules,
    businessModules: silConfidence < 0.45 ? [] : businessModules,
    workModules: silConfidence < 0.45 ? [] : workModules,
    corridorModules: silConfidence < 0.45 ? [] : corridorModules,
    createdAt: new Date().toISOString(),
    silDomain,
    silConfidence,
    reason: silConfidence < 0.45 ? 'needs-clarification: SIL confidence too low for auto-scaffold' : (sil.reason || 'derived')
  };

  return plan;
}

export function applyBuildPlan(plan: BuildPlan): BuildResult {
  const V2 = path.resolve(process.cwd());
  const PERSON_ROOT = path.join(V2, 'persons', plan.personSlug);
  const createdFiles: string[] = [];

  // create base dirs
  const baseDirs = ['home','work','business','life','config/modules','scripts'];
  for (const d of baseDirs) ensureDir(path.join(PERSON_ROOT, d));

  // write module configs
  const writeModule = (sphere: string, mod: string) => {
    const target = path.join(PERSON_ROOT, 'config', 'modules', sphere, `${mod}.json`);
    ensureDir(path.dirname(target));
    const payload = { module: mod, enabled: true, createdAt: plan.createdAt, silDomain: plan.silDomain, silConfidence: plan.silConfidence, reason: plan.reason || 'derived-from-onboarding' };
    try { fs.writeFileSync(target, JSON.stringify(payload, null, 2), 'utf8'); createdFiles.push(target); } catch (e) { }
  };

  for (const m of plan.homeModules) writeModule('home', m);
  for (const m of plan.businessModules) writeModule('business', m);
  for (const m of plan.workModules) writeModule('work', m);
  for (const m of plan.corridorModules) writeModule('life', m);

  // surfaces: simple README
  for (const s of plan.spheres) {
    const readme = path.join(PERSON_ROOT, s, 'README.md');
    try { fs.writeFileSync(readme, `# ${s}\n\nManaged by CAIA.`, 'utf8'); createdFiles.push(readme); } catch (e) { }
  }

  // scripts: Home
  let haveYouHomePath: string | undefined;
  let caiaHomeScriptsPath: string | undefined;
  if (plan.homeModules && plan.homeModules.length) {
    haveYouHomePath = path.join(PERSON_ROOT, 'scripts', 'have-you-home.json');
    const items: any[] = [];
    if (plan.homeModules.includes('home.faith')) items.push({ id: 'hv-home-faith', text: 'Have you set your nightly prayer or reflection?', status: 'pending' });
    items.push({ id: 'hv-home-unwind', text: 'Have you scheduled one Unwind slot this week?', status: 'pending' });
    items.push({ id: 'hv-home-shopping', text: "Have you added this week's shopping + cleaning tasks?", status: 'pending' });
    try { fs.writeFileSync(haveYouHomePath, JSON.stringify({ items, createdAt: plan.createdAt }, null, 2), 'utf8'); createdFiles.push(haveYouHomePath); } catch (e) { }

    caiaHomeScriptsPath = path.join(PERSON_ROOT, 'scripts', 'caia-home.json');
    const homeScripts = [{ id: 'home.faith.nightly', prompt: 'Guide me through my nightly prayer and reflection.' }];
    try { fs.writeFileSync(caiaHomeScriptsPath, JSON.stringify({ scripts: homeScripts, createdAt: plan.createdAt }, null, 2), 'utf8'); createdFiles.push(caiaHomeScriptsPath); } catch (e) { }
  }

  // scripts: Business
  let haveYouBusinessPath: string | undefined;
  let caiaBusinessScriptsPath: string | undefined;
  if (plan.businessModules && plan.businessModules.length) {
    haveYouBusinessPath = path.join(PERSON_ROOT, 'scripts', 'have-you-business.json');
    const items: any[] = [ { id: 'hv-biz-01', text: 'Have you added your first 3 customers?', status: 'pending' }, { id: 'hv-biz-cash', text: 'Have you checked this week\'s cash flow?', status: 'pending' } ];
    try { fs.writeFileSync(haveYouBusinessPath, JSON.stringify({ items, createdAt: plan.createdAt }, null, 2), 'utf8'); createdFiles.push(haveYouBusinessPath); } catch (e) { }

    caiaBusinessScriptsPath = path.join(PERSON_ROOT, 'scripts', 'caia-business.json');
    const bizScripts = [{ id: 'business.cleaning.daystart', prompt: 'Start-of-day checklist for cleaning crew.' }];
    try { fs.writeFileSync(caiaBusinessScriptsPath, JSON.stringify({ scripts: bizScripts, createdAt: plan.createdAt }, null, 2), 'utf8'); createdFiles.push(caiaBusinessScriptsPath); } catch (e) { }
  }

  // scripts: Work
  let haveYouWorkPath: string | undefined;
  let caiaWorkScriptsPath: string | undefined;
  if (plan.workModules && plan.workModules.length) {
    haveYouWorkPath = path.join(PERSON_ROOT, 'scripts', 'have-you-work.json');
    const items = [
      { id: 'hv-work-1', text: 'Have you checked today\'s WorkFocus in 3x3 DTD?', status: 'pending' },
      { id: 'hv-work-2', text: 'Have you cleared your CIMS notifications?', status: 'pending' }
    ];
    try { fs.writeFileSync(haveYouWorkPath, JSON.stringify({ items, createdAt: plan.createdAt }, null, 2), 'utf8'); createdFiles.push(haveYouWorkPath); } catch (e) { }

    caiaWorkScriptsPath = path.join(PERSON_ROOT, 'scripts', 'caia-work.json');
    const workScripts = [
      { id: 'work.daily.start', prompt: 'Walk me through my Work OS start-of-day checklist.' },
      { id: 'work.daily.end', prompt: 'Close my workday and summarise what I achieved.' }
    ];
    try { fs.writeFileSync(caiaWorkScriptsPath, JSON.stringify({ scripts: workScripts, createdAt: plan.createdAt }, null, 2), 'utf8'); createdFiles.push(caiaWorkScriptsPath); } catch (e) { }
  }

  const result: BuildResult = {
    plan,
    root: PERSON_ROOT,
    createdFiles,
    haveYouHomePath,
    haveYouBusinessPath,
    haveYouWorkPath,
    caiaHomeScriptsPath,
    caiaBusinessScriptsPath,
    caiaWorkScriptsPath
  };

  return result;
}

export function recordSystemBuild(plan: BuildPlan, result: Partial<BuildResult>, outcome: 'green' | 'red' | 'clarify', reason?: string) {
  try {
    const V2 = path.resolve(process.cwd());
    const dr = path.join(V2, 'tools', 'decision-record.mjs');
    const msg = reason ? String(reason) : '';
    spawnSync(process.execPath, [dr, 'record', 'system-builder.life-os', outcome, msg], { cwd: V2, stdio: 'ignore' });

    if (outcome === 'green') {
      const snapPath = path.join(V2, '.corae', 'system-builder-life-last.json');
      try {
        ensureDir(path.dirname(snapPath));
        fs.writeFileSync(snapPath, JSON.stringify({ plan, result, ts: new Date().toISOString() }, null, 2), 'utf8');
      } catch (e) { }
    }
  } catch (e) {
    // swallow
  }
}

// CLI test helper
if (typeof process !== 'undefined' && require.main === module) {
  const arg = process.argv[2] || '';
  if (arg === '--test') {
    const mock = {
      subjectId: 'test-1',
      name: 'Test Person',
      sphere: 'mixed',
      lifeStage: 'single',
      businessType: 'cleaning',
      roleTitle: 'Owner',
      employerName: 'TestCo'
    } as OnboardingPayload;
    try {
      const plan = planFromOnboarding(mock);
      console.log('PLAN:', JSON.stringify(plan, null, 2));
      if (!plan.homeModules.length && !plan.businessModules.length && !plan.workModules.length) {
        console.log('NO MODULES: needs clarification');
        process.exit(0);
      }
      const res = applyBuildPlan(plan);
      console.log('RESULT:', JSON.stringify(res, null, 2));
      process.exit(0);
    } catch (e) {
      const errMsg = (e && typeof e === 'object' && 'message' in e) ? (e as any).message : String(e);
      console.error('ERROR:', String(errMsg));
      process.exit(2);
    }
  }
}
