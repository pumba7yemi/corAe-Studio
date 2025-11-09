import { Rule, RuleContext } from "./types.js";

export const readyIfOverdue =
  (hours: number): Rule =>
  (ctx, item) => {
    const now = ctx.now.getTime();
    const dueAt = item.dueAt ? new Date(item.dueAt).getTime() : undefined;
    if (!dueAt) return { status: "READY", reason: "No due date set" };

    const overdue = now - dueAt >= hours * 3600_000;
    return overdue
      ? { status: "READY", reason: `Overdue ≥ ${hours}h` }
      : { status: "PENDING", reason: "Not overdue yet" };
  };

export const alwaysReady: Rule = () => ({ status: "READY" });

export const pendingUntil =
  (iso: string): Rule =>
  (ctx) => (ctx.now < new Date(iso) ? { status: "PENDING" } : { status: "READY" });

export const blockedByTag =
  (tag: string): Rule =>
  (ctx, item) => {
    return item.tags?.includes(tag)
      ? { status: "BLOCKED", reason: `Blocked by tag ${tag}` }
      : { status: "READY" };
  };

// Example: gate on weekly cadence
export const weeklyWindow =
  (weekday: number): Rule =>
  (ctx, item) => {
    const day = ctx.now.getDay(); // 0=Sun
    if (day === weekday) return { status: "READY", reason: "Weekly window" };
    return { status: "PENDING", reason: "Outside weekly window" };
  };