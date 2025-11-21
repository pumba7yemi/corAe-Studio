import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const V2_ROOT = path.resolve(process.cwd(), 'corAe-Studio-v2');

export interface GovernanceCheck { id: string; label: string; ok: boolean; details?: string; }
export interface GovernanceAuditResult { ts: string; overallOk: boolean; checks: GovernanceCheck[]; }

function safeReadJson(p: string): any | null {
  try { const raw = fs.readFileSync(p, 'utf8'); return JSON.parse(raw); } catch { return null; }
}

export * from "../GOVERNANCE/tools/governance-audit.mts";
