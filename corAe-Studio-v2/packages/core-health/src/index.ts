export type CorridorMode = 'GREEN' | 'AMBER' | 'RED';

export function computeCorridorMode(score: number, gateMin = 140): CorridorMode {
  // simple heuristic: score is 0-200-ish; gateMin is CAIA min threshold
  if (score >= gateMin + 10) return 'GREEN';
  if (score >= gateMin - 10) return 'AMBER';
  return 'RED';
}

export function normalizeScore(input: number | string | null | undefined): number {
  const n = Number(input ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(200, Math.round(n)));
}
