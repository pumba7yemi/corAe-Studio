import fs from 'fs';
import path from 'path';
import { computeCorridorMode, normalizeScore } from '../../../packages/core-health/src/index';

const DM_PATH = path.resolve(process.cwd(), '.corae', 'decision-memory.json');

export async function readLatestHealthEntry() {
  try {
    const raw = await fs.promises.readFile(DM_PATH, 'utf8');
    const lines = raw.trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj?.type === 'human-health') return obj;
      } catch (e) {
        // ignore malformed lines
      }
    }
  } catch (e) {
    // missing file or unreadable
  }
  return null;
}

export async function currentHealthSummary() {
  const entry = await readLatestHealthEntry();
  const rawScore = entry?.payload?.score ?? null;
  const score = normalizeScore(rawScore);
  const gateMin = Number(process.env.CAIA_GATE_MIN ?? 140);
  const mode = computeCorridorMode(score, gateMin);
  return { score, mode, entry };
}
