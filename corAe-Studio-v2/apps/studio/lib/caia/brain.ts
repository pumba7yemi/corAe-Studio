import { listBundles, loadBundle } from "@/lib/workfocus/io";
import { computeNextOccurrence } from "@/lib/workfocus/scheduler";
import type { CaiaMessage } from "./types";
import { dailyBrief } from "./voice";

export type TodayPick = {
  bundleId: string;
  nodeId: string;
  title: string;
  role: string;
  when?: string;
  deadline?: string;
  nextAt?: Date | null;
};

export async function pickToday(now = new Date()) {
  const bundleIds = await listBundles();
  const picks: Record<string, TodayPick[]> = {};

  for (const id of bundleIds) {
    const bundle = await loadBundle(id);
    const rows: TodayPick[] = bundle.nodes.map((n) => {
      const when = n.meta?.when as string | undefined;
      const deadline = n.meta?.deadline as string | undefined;
      const nextAt = computeNextOccurrence(when, deadline, now);
      return { bundleId: id, nodeId: n.id, title: n.title, role: n.role, when, deadline, nextAt };
    });

    // today if same weekday & date
    const today = rows
      .filter(r => r.nextAt && sameDay(r.nextAt, now))
      .sort((a,b) => (a.nextAt!.getTime() - b.nextAt!.getTime()));

    if (today.length) picks[id] = today;
  }
  return picks;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}

/** Compose CAIA messages (CIMS + optional email) for each bundle. */
export async function composeDailyMessages(now = new Date()): Promise<CaiaMessage[]> {
  const picks = await pickToday(now);
  const messages: CaiaMessage[] = [];

  for (const [bundleId, items] of Object.entries(picks)) {
    const bundle = await loadBundle(bundleId);
    const titles = items.map(i => i.title);

    // CIMS daily brief to Owner (adapt to your routing)
    messages.push({
      to: "owner", channel: "cims", persona: "daily_brief",
      subject: `Today’s WorkFocus (${bundle.title})`,
      text: dailyBrief(bundle, titles),
    });

    // Optional email summary to finance/ops
    messages.push({
      to: ["ops@company", "finance@company"], channel: "email", persona: "daily_brief",
      subject: `WorkFocus — Today’s cadence for ${bundle.title}`,
      text: dailyBrief(bundle, titles),
    });
  }
  return messages;
}
