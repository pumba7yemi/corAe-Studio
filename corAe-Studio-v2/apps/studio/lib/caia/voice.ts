import { WorkFocusBundle } from "@/lib/workfocus/types";

export function nudgeTone(line: string) {
  // CAIA's rhythm: short, clear, kind, forward-moving.
  return `${line}\n— CAIA · corAe`;
}

export function dailyBrief(bundle: WorkFocusBundle, dueTitles: string[]) {
  const intro = `Good morning — here’s today’s WorkFocus cadence for ${bundle.title}:`;
  const bullets = dueTitles.map(t => `• ${t}`).join("\n");
  const close = `Answer each card Yes/No. If No, I’ll nudge and create the next steps.`;
  return nudgeTone([intro, bullets, "", close].join("\n"));
}
