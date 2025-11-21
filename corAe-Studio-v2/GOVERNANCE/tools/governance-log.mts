import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const V2_ROOT = path.resolve(process.cwd(), 'corAe-Studio-v2');
const HIST = path.join(V2_ROOT, 'GOVERNANCE', 'core', 'history.json');

export type GovernanceKind = 'ship-blocked' | 'ship-allowed' | 'build-green' | 'build-red' | 'audit-run';
export interface GovernanceLogPayload { actor?: 'ci'|'local'|'ship'|'system'; kind: GovernanceKind; reason?: string; details?: any }

function safeRead(): any { try { const r = fs.readFileSync(HIST,'utf8'); return JSON.parse(r); } catch { return { entries: [] }; } }
function safeWrite(obj:any){ try{ fs.mkdirSync(path.dirname(HIST),{recursive:true}); fs.writeFileSync(HIST, JSON.stringify(obj,null,2),'utf8'); }catch(e){ console.warn('govlog write failed', e); } }

export function logGovernanceEvent(payload: GovernanceLogPayload): void {
  try{
    const cur = safeRead();
    const entries = Array.isArray(cur.entries)?cur.entries:[];
    const entry = { ts: new Date().toISOString(), actor: payload.actor ?? 'system', kind: payload.kind, reason: payload.reason ?? null, details: payload.details ?? null };
    entries.push(entry);
    const trimmed = entries.slice(-200);
    safeWrite({ entries: trimmed });
  }catch(e:any){ console.warn('logGovernanceEvent error', e?.message ?? e); }
}
