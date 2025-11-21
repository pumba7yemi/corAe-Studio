import fs from 'node:fs';
import path from 'node:path';
// dynamically import role-script-builder.mts inside functions to avoid case-sensitivity issues

const ROOT = path.resolve(process.cwd(), 'corAe-Studio-v2');
const PERSONS_ROOT = path.join(ROOT, 'persons');

export type Sphere = 'home' | 'work' | 'business';

export interface PersonaCore {
  slug: string;
  fullName: string;
  roleTitle?: string;
  employerName?: string;
  spheres: Sphere[];
}

export interface ScriptBuildSummary {
  slug: string;
  spheres: Sphere[];
  created: string[];
  skipped: string[];
}

/**
 * Write a file only if it does not already exist, OR if it contains
 * the `// corAe:system-generated` marker on the first line.
 */
export function writeSystemFileIfSafe(filePath: string, content: string, marker = '// corAe:system-generated') {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (!existing.startsWith(marker)) {
      return { action: 'skipped' as const };
    }
  }
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const final = `${marker}\n${content}`;
  fs.writeFileSync(filePath, final, 'utf8');
  return { action: 'written' as const };
}

function homeTemplates(core: PersonaCore, baseDir: string) {
  const created: string[] = [];
  const skipped: string[] = [];

  const files: Record<string, string> = {
    'home/corridor.json': JSON.stringify({
      version: 1,
      owner: core.fullName,
      spheres: ['home'],
      corridor: {
        morning: ['Wake', 'Prayer / reflection', 'Health check', '3³DTD setup'],
        day: ['Home tasks', 'Self-care', 'Family time'],
        night: ['Gratitude', 'Shutdown', 'Sleep routine']
      }
    }, null, 2),

    'home/daily-3x3dtd.json': JSON.stringify({
      version: 1,
      owner: core.fullName,
      model: '3³DTD',
      buckets: ['Inbox', '3 Priority Tasks', 'Ongoing']
    }, null, 2)
  };

  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(baseDir, rel);
    const res = writeSystemFileIfSafe(abs, body);
    (res.action === 'written' ? created : skipped).push(rel);
  }

  return { created, skipped };
}

function workTemplates(core: PersonaCore, baseDir: string) {
  const created: string[] = [];
  const skipped: string[] = [];

  const files: Record<string, string> = {
    'work/daily-workfocus.json': JSON.stringify({
      version: 1,
      owner: core.fullName,
      roleTitle: core.roleTitle ?? 'Workflow Partner',
      model: 'HaveYou-3³DTD',
      prompts: [
        'Have you completed your 3 priority tasks?',
        'If not → What is blocking you?',
        'If yes → Move to next Work Focus.'
      ]
    }, null, 2),

    'work/my-day.md': [
      '# ' + (core.fullName || core.slug) + ' — Work Day',
      '',
      '- Morning: Review 3 priority tasks in corAe Work OS',
      '- Midday: Check CIMS / email inboxes',
      '- Evening: Close loops and update 3³DTD'
    ].join('\n')
  };

  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(baseDir, rel);
    const res = writeSystemFileIfSafe(abs, typeof body === 'string' ? body : String(body));
    (res.action === 'written' ? created : skipped).push(rel);
  }

  return { created, skipped };
}

function businessTemplates(core: PersonaCore, baseDir: string) {
  const created: string[] = [];
  const skipped: string[] = [];

  const files: Record<string, string> = {
    'business/obari-quickstart.md': [
      '# OBARI Quickstart — ' + (core.employerName ?? 'My Business'),
      '',
      '1. **Order** — Capture every inbound opportunity.',
      '2. **Booking** — Confirm slots / commitments.',
      '3. **Active** — Delivery / execution state.',
      '4. **Reporting** — Document outcomes & metrics.',
      '5. **Invoicing** — Close the loop and reconcile.'
    ].join('\n'),

    'business/weekly-review.json': JSON.stringify({
      version: 1,
      owner: core.fullName,
      business: core.employerName ?? null,
      cadence: 'weekly',
      checklist: [
        'Review sales vs targets',
        'Review open OBARI items',
        'Check cashflow / upcoming invoices',
        "Plan next week's priorities"
      ]
    }, null, 2)
  };

  for (const [rel, body] of Object.entries(files)) {
    const abs = path.join(baseDir, rel);
    const res = writeSystemFileIfSafe(abs, body);
    (res.action === 'written' ? created : skipped).push(rel);
  }

  return { created, skipped };
}

export async function buildPersonScripts(core: PersonaCore): Promise<ScriptBuildSummary> {
  const personDir = path.join(PERSONS_ROOT, core.slug);
  const baseDir = personDir;

  const created: string[] = [];
  const skipped: string[] = [];

  if (core.spheres.includes('home')) {
    const r = homeTemplates(core, baseDir);
    created.push(...r.created);
    skipped.push(...r.skipped);
  }
  if (core.spheres.includes('work')) {
    const r = workTemplates(core, baseDir);
    created.push(...r.created);
    skipped.push(...r.skipped);
  }
  if (core.spheres.includes('business')) {
    const r = businessTemplates(core, baseDir);
    created.push(...r.created);
    skipped.push(...r.skipped);
  }

  return {
    slug: core.slug,
    spheres: core.spheres,
    created,
    skipped
  };
}

export async function buildMergedPersonScripts(core: PersonaCore): Promise<ScriptBuildSummary> {
  const personDir = path.join(PERSONS_ROOT, core.slug);
  const baseDir = personDir;
  const created: string[] = [];
  const skipped: string[] = [];

  // load parent + role templates (import dynamically to avoid casing conflicts)
    const { loadBusinessParent, loadRoleTemplates } = await import(new URL('./role-script-builder.mts', import.meta.url).href);
    const parent = loadBusinessParent();
    const roles = Array.isArray((core as any).roles) ? (core as any).roles : [];
    const roleData = loadRoleTemplates(roles);

  // merge helpers
  const mergeArrays = (items: any[]) => {
    const byId = new Map();
    for (const it of items || []) {
      const id = it && it.id ? it.id : JSON.stringify(it);
      if (!byId.has(id)) byId.set(id, it);
    }
    return Array.from(byId.values());
  };

  // Build merged home daily-3x3dtd.json
  const home3x3: any[] = [];
  if (Array.isArray(parent.haveYou)) home3x3.push(...parent.haveYou);
  for (const r of roles) {
    const rd = roleData[r]; if (rd && Array.isArray(rd.haveYou)) home3x3.push(...rd.haveYou);
  }
  // person-level: attempt to read existing and include
  try {
    const p = path.join(baseDir, 'home', 'daily-3x3dtd.json');
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) home3x3.push(...parsed);
    }
  } catch {}
  const mergedHome3x3 = mergeArrays(home3x3);
  const home3x3Path = path.join(baseDir, 'home', 'daily-3x3dtd.json');
  const res1 = writeSystemFileIfSafe(home3x3Path, JSON.stringify(mergedHome3x3, null, 2));
  (res1.action === 'written' ? created : skipped).push('home/daily-3x3dtd.json');

  // Build merged home corridor (scripts)
  const homeCorr: any[] = [];
  if (Array.isArray(parent.parentTasks)) homeCorr.push(...parent.parentTasks);
  for (const r of roles) { const rd = roleData[r]; if (rd && Array.isArray(rd.tasks)) homeCorr.push(...rd.tasks); }
  try { const p = path.join(baseDir, 'home', 'corridor.json'); if (fs.existsSync(p)) { const raw = fs.readFileSync(p, 'utf8'); const parsed = JSON.parse(raw); if (Array.isArray(parsed)) homeCorr.push(...parsed); } } catch {}
  const mergedHomeCorr = mergeArrays(homeCorr);
  const homeCorrPath = path.join(baseDir, 'home', 'corridor.json');
  const res2 = writeSystemFileIfSafe(homeCorrPath, JSON.stringify(mergedHomeCorr, null, 2));
  (res2.action === 'written' ? created : skipped).push('home/corridor.json');

  // Work daily focus
  const workTasks: any[] = [];
  for (const r of roles) { const rd = roleData[r]; if (rd && Array.isArray(rd.tasks)) workTasks.push(...rd.tasks); }
  try { const p = path.join(baseDir, 'work', 'daily-workfocus.json'); if (fs.existsSync(p)) { const raw = fs.readFileSync(p, 'utf8'); const parsed = JSON.parse(raw); if (Array.isArray(parsed)) workTasks.push(...parsed); } } catch {}
  const mergedWork = mergeArrays(workTasks);
  const workPath = path.join(baseDir, 'work', 'daily-workfocus.json');
  const res3 = writeSystemFileIfSafe(workPath, JSON.stringify(mergedWork, null, 2));
  (res3.action === 'written' ? created : skipped).push('work/daily-workfocus.json');

  // Business weekly review
  const bizTasks: any[] = [];
  if (Array.isArray(parent.parentTasks)) bizTasks.push(...parent.parentTasks);
  for (const r of roles) { const rd = roleData[r]; if (rd && Array.isArray(rd.tasks)) bizTasks.push(...rd.tasks); }
  try { const p = path.join(baseDir, 'business', 'weekly-review.json'); if (fs.existsSync(p)) { const raw = fs.readFileSync(p, 'utf8'); const parsed = JSON.parse(raw); if (Array.isArray(parsed)) bizTasks.push(...parsed); } } catch {}
  const mergedBiz = mergeArrays(bizTasks);
  const bizPath = path.join(baseDir, 'business', 'weekly-review.json');
  const res4 = writeSystemFileIfSafe(bizPath, JSON.stringify(mergedBiz, null, 2));
  (res4.action === 'written' ? created : skipped).push('business/weekly-review.json');

  return { slug: core.slug, spheres: core.spheres, created, skipped };
}
