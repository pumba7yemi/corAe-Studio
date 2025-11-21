export function registerTimeGain(minutes: number) {
  // Minimal stub: map minutes to a simple points metric.
  const points = Math.max(0, Math.round(minutes));
  // In a real implementation this would call Ascend APIs or update user pulse state.
  console.debug("Ascend: registerTimeGain", { minutes, points });
  return { ok: true, minutes, points };
}
