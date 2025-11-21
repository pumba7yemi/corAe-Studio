import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadConstitution, validateConstitution } from '../../CORAE_CONSTITUTION/CEL/enforce.mjs';
import { scanForQuestionFirst } from '../../CORAE_CONSTITUTION/CEL/behavior.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const V2_ROOT = path.resolve(process.cwd(), 'corAe-Studio-v2');

export interface GovernanceCheck { id: string; label: string; ok: boolean; details?: string; }
export interface GovernanceAuditResult { ts: string; overallOk: boolean; checks: GovernanceCheck[]; }

function safeReadJson(p: string): any | null {
  try { const raw = fs.readFileSync(p, 'utf8'); return JSON.parse(raw); } catch { return null; }
}

export function runGovernanceAudit(): GovernanceAuditResult {
  const checks: GovernanceCheck[] = [];
  const now = new Date().toISOString();

  const coreFiles = [
    path.join(V2_ROOT, 'GOVERNANCE', 'core', 'shipping-allowed.json'),
    path.join(process.cwd(), '.github', 'workflows', 'observer-ci.yml'),
    path.join(process.cwd(), '.github', 'workflows', 'shipping.yml'),
    path.join(V2_ROOT, 'docs', 'BUILD_GOVERNANCE.md')
  ];

  for (const cf of coreFiles) {
    const exists = fs.existsSync(cf);
    checks.push({ id: path.relative(process.cwd(), cf), label: cf, ok: exists, details: exists ? 'present' : 'missing' });
  }

  // Optional files
  const optional = [
    path.join(V2_ROOT, 'docs', 'SIL-RULE.md'),
    path.join(V2_ROOT, 'docs', 'CONSTITUTION-GROWTH.md')
  ];
  for (const ofl of optional) {
    const exists = fs.existsSync(ofl);
    checks.push({ id: path.relative(process.cwd(), ofl), label: ofl, ok: true, details: exists ? 'present' : 'optional, not present' });
  }

  // shipping toggle validation
  const togglePath = path.join(V2_ROOT, 'GOVERNANCE', 'core', 'shipping-allowed.json');
  const toggle = safeReadJson(togglePath);
  if (!toggle) {
    checks.push({ id: 'shipping-toggle', label: togglePath, ok: false, details: 'missing or invalid JSON' });
  } else if (typeof toggle.allowShipping !== 'boolean') {
    checks.push({ id: 'shipping-toggle', label: togglePath, ok: false, details: 'allowShipping not boolean' });
  } else {
    checks.push({ id: 'shipping-toggle', label: togglePath, ok: true, details: `allowShipping=${String(toggle.allowShipping)}` });
  }

  // last-known-good-build (optional)
  const lkgPath = path.join(V2_ROOT, '.corae', 'last-known-good-build.json');
  const lkg = safeReadJson(lkgPath);
  if (lkg) {
    const ok = typeof lkg.subject === 'string' && typeof lkg.ts === 'string' && typeof lkg.score150 === 'number';
    checks.push({ id: 'last-known-good-build', label: lkgPath, ok, details: ok ? `subject=${lkg.subject} score150=${lkg.score150}` : 'present but invalid' });
  } else {
    checks.push({ id: 'last-known-good-build', label: lkgPath, ok: true, details: 'optional, not present' });
  }

  // Try to run decision-record metrics (best-effort)
  try {
    const drPath = path.join(V2_ROOT, 'tools', 'decision-record.mjs');
    if (fs.existsSync(drPath)) {
      checks.push({ id: 'decision-record', label: drPath, ok: true, details: 'present (metrics can be queried separately)' });
    } else {
      checks.push({ id: 'decision-record', label: drPath, ok: false, details: 'missing' });
    }
  } catch (e:any) {
    checks.push({ id: 'decision-record', label: 'decision-record', ok: false, details: String(e?.message ?? e) });
  }

  // Ship configs (informational)
  try {
    const shipsDir = path.join(V2_ROOT, 'GOVERNANCE', 'ships');
    let shipConfigCount = 0;
    if (fs.existsSync(shipsDir)) {
      const items = fs.readdirSync(shipsDir);
      shipConfigCount += items.filter((f) => f.endsWith('.config.json')).length;
      for (const it of items) {
        const p = path.join(shipsDir, it, 'ship.config.json');
        if (fs.existsSync(p)) shipConfigCount++;
      }
    }
    checks.push({
      id: 'ship-config',
      label: 'Ship configs present',
      ok: shipConfigCount >= 0,
      details: shipConfigCount === 0 ? 'No ship configs found yet (wizard may not have been run).' : `Found ${shipConfigCount} ship config file(s) in .corae/ships`,
    });
  } catch (e:any) {
    checks.push({ id: 'ship-config', label: 'Ship configs present', ok: true, details: 'Could not inspect .corae/ships' });
  }

  // Constitution presence & structure check (Master Constitution enforcement)
  try {
    // Use CEL enforcement module to validate the constitution
    let ok = false;
    let details = '';
    try {
      const constitutionRaw = loadConstitution();
      const cVal = validateConstitution(constitutionRaw);
      ok = cVal.ok;
      details = cVal.ok ? 'CONSTITUTION.md present and contains required sections.' : `Errors: ${cVal.errors.join('; ')}`;
    } catch (e:any) {
      ok = false;
      details = `CONSTITUTION read/validate failed: ${String(e?.message ?? e)}`;
    }
    checks.push({ id: 'constitution', label: 'Master Constitution', ok, details });
  } catch (e:any) {
    checks.push({ id: 'constitution', label: 'Master Constitution', ok: false, details: String(e?.message ?? e) });
  }

  // No-Questions Best-Effort execution check (NQBE)
  try {
    const constitutionRaw = loadConstitution();
    const nqbeRaw = fs.readFileSync(path.join(process.cwd(), 'corAe-Studio-v2', 'GOVERNANCE', 'core', 'NO_QUESTIONS_EXECUTION.md'), 'utf8');
    const b1 = scanForQuestionFirst(constitutionRaw);
    const b2 = scanForQuestionFirst(nqbeRaw);
    const ok = b1.ok && b2.ok;
    const details = [...b1.hits, ...b2.hits];
    checks.push({ id: 'no-questions-execution', label: 'NQBE enforcement', ok, details });
  } catch (e:any) {
    checks.push({ id: 'no-questions-execution', label: 'NQBE enforcement', ok: false, details: String(e?.message ?? e) });
  }

  const overallOk = checks.filter(c => c.ok===false).length === 0;
  return { ts: now, overallOk, checks };
}
