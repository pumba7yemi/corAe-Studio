export type PulseProgress = { targetAED: number; recoveredAED: number; percent: number };

export function initPulseFromNeed(monthlyDelta: number): PulseProgress {
  const target = monthlyDelta < 0 ? Math.abs(monthlyDelta) : 0;
  return { targetAED: target, recoveredAED: 0, percent: target ? 0 : 100 };
}

export function addRecovery(p: PulseProgress, earned: number): PulseProgress {
  const recoveredAED = Math.max(0, p.recoveredAED + earned);
  const percent = p.targetAED ? Math.min(100, Math.round((recoveredAED / p.targetAED) * 100)) : 100;
  return { ...p, recoveredAED, percent };
}
