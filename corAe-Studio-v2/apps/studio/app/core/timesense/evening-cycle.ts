export function idealBedtime(wakeTimeIsoOrHHMM: string, requiredSleepHours = 8): string {
  // Accept simple HH:MM or ISO
  let wakeHH = 7;
  let wakeMM = 0;
  try {
    if (wakeTimeIsoOrHHMM.includes(":")) {
      const [hh, mm] = wakeTimeIsoOrHHMM.split(":").map((s) => parseInt(s, 10));
      wakeHH = isNaN(hh) ? 7 : hh;
      wakeMM = isNaN(mm) ? 0 : mm;
    }
  } catch {}
  const wakeDate = new Date();
  wakeDate.setHours(wakeHH, wakeMM, 0, 0);
  const bedtime = new Date(wakeDate.getTime() - requiredSleepHours * 60 * 60 * 1000);
  const hh = String(bedtime.getHours()).padStart(2, "0");
  const mm = String(bedtime.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function suggestEveningPurchase(minutesLostToday: number) {
  if (minutesLostToday <= 0) return null;
  const steps = [] as string[];
  if (minutesLostToday >= 30) {
    steps.push("Shift screens earlier by 30–60 minutes.");
    steps.push("Prepare clothes and breakfast the night before.");
    steps.push("Limit late meetings or deep work after 20:30.");
  } else {
    steps.push("Identify a single 10–15 minute change: prep or bed earlier.");
  }
  return {
    minutes: minutesLostToday,
    actions: steps,
    message: `Buy back ${minutesLostToday} minutes tonight with small evening changes.`,
  };
}
