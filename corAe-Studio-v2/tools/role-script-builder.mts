import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'corAe-Studio-v2');
const BUSINESS_PARENT = path.join(ROOT, 'business', '_parent');
const ROLES_DIR = path.join(ROOT, 'business', 'roles');

function safeReadJson(p: string) {
  try {
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

export function listRoles(): string[] {
  try {
    if (!fs.existsSync(ROLES_DIR)) return [];
    return fs.readdirSync(ROLES_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
  } catch {
    return [];
  }
}

export function loadBusinessParent() {
  const out: { parentTasks: any[]; haveYou: any[]; threeByThree: any[] } = { parentTasks: [], haveYou: [], threeByThree: [] };
  try {
    const p1 = path.join(BUSINESS_PARENT, 'parent-script.json');
    const p2 = path.join(BUSINESS_PARENT, 'business-have-you.json');
    const p3 = path.join(BUSINESS_PARENT, 'business-3x3dtd.json');
    const a1 = safeReadJson(p1); if (Array.isArray(a1)) out.parentTasks = a1;
    const a2 = safeReadJson(p2); if (Array.isArray(a2)) out.haveYou = a2;
    const a3 = safeReadJson(p3); if (Array.isArray(a3)) out.threeByThree = a3;
  } catch {
    // ignore
  }
  return out;
}

export function loadRoleTemplates(roleNames: string[]) {
  const out: Record<string, { tasks: any[]; haveYou: any[]; threeByThree: any[] }> = {};
  for (const r of roleNames || []) {
    const base = path.join(ROLES_DIR, r);
    const tasks: any[] = [];
    const haveYou: any[] = [];
    const threeByThree: any[] = [];
    try {
      const a = safeReadJson(path.join(base, 'script.json')); if (Array.isArray(a)) tasks.push(...a);
      const b = safeReadJson(path.join(base, 'role-have-you.json')); if (Array.isArray(b)) haveYou.push(...b);
      const c = safeReadJson(path.join(base, 'role-3x3dtd.json')); if (Array.isArray(c)) threeByThree.push(...c);
    } catch {
      // ignore
    }
    out[r] = { tasks, haveYou, threeByThree };
  }
  return out;
}

export function mergeForRole(roleName: string, personaOverrides: any = {}) {
  const parent = loadBusinessParent();
  const role = loadRoleTemplates([roleName])[roleName] || { tasks: [], haveYou: [], threeByThree: [] };
  // simple merge: parent tasks then role then persona overrides if arrays
  return {
    tasks: [...parent.parentTasks, ...role.tasks, ...(Array.isArray(personaOverrides.tasks) ? personaOverrides.tasks : [])],
    haveYou: [...parent.haveYou, ...role.haveYou, ...(Array.isArray(personaOverrides.haveYou) ? personaOverrides.haveYou : [])],
    threeByThree: [...parent.threeByThree, ...role.threeByThree, ...(Array.isArray(personaOverrides.threeByThree) ? personaOverrides.threeByThree : [])]
  };
}
