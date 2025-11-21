import { WeekRef } from "@prisma/client";
export function getCurrentWeekRef(): WeekRef {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(),0,0).getTime()) / 86400000);
  const weekInCycle = ((Math.floor(dayOfYear / 7) % 4) + 1) as 1|2|3|4;
  return `W${weekInCycle}` as WeekRef;
}
export function getNextWeekRef(): WeekRef {
  const current = getCurrentWeekRef();
  const nextMap: Record<WeekRef, WeekRef> = { W1:"W2", W2:"W3", W3:"W4", W4:"W1" };
  return nextMap[current];
}
