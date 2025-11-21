import fs from "node:fs";
import path from "node:path";
import {
  buildDayPlan,
  type ScriptTask,
  type BuildDayInput,
} from "./timesense-core.mts";

const ROOT = path.resolve(process.cwd(), "corAe-Studio-v2");
const PERSONS_DIR = path.join(ROOT, "persons");

function listPersons(): string[] {
  if (!fs.existsSync(PERSONS_DIR)) return [];
  return fs
    .readdirSync(PERSONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function pickPrimarySlug(): string | null {
  const slugs = listPersons().sort();
  return slugs[0] ?? null;
}

function loadScriptTasksForSlug(slug: string): ScriptTask[] {
  const base = path.join(PERSONS_DIR, slug);
  const tasks: ScriptTask[] = [];

  const tryJson = (rel: string, source: ScriptTask["source"]) => {
    const p = path.join(base, rel);
    if (!fs.existsSync(p)) return;
    try {
      const raw = fs.readFileSync(p, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          tasks.push({
            id: item.id || `${source}-${Date.now()}-${tasks.length}`,
            label: (item as any).label || (item as any).title || "Task",
            source,
            durationMinutes:
              (item as any).durationMinutes || (item as any).duration || 15,
            nonNegotiable: !!(item as any).nonNegotiable,
            basePriority: (item as any).basePriority ?? 3,
          });
        }
      }
    } catch {
      // ignore invalid JSON
    }
  };

  tryJson("home/daily-3x3dtd.json", "3x3dtd");
  tryJson("home/corridor.json", "script");
  tryJson("work/daily-workfocus.json", "work");
  tryJson("business/weekly-review.json", "script");

  return tasks;
}

function tomorrowUtc(): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() + 1);
  return now.toISOString().slice(0, 10);
}

async function main() {
  const slug = pickPrimarySlug();
  if (!slug) {
    console.warn("[TimeSense-nightly] No personas found in persons/, skipping plan build.");
    process.exit(0);
  }

  const tasks = loadScriptTasksForSlug(slug);

  const date = tomorrowUtc();
  const input: BuildDayInput = {
    date,
    wakeTime: "07:00",
    sleepTime: "23:00",
    scriptTasks: tasks,
  };

  try {
    const plan = buildDayPlan(input);
    console.log("[TimeSense-nightly] Built plan for", slug, "date", plan.date, "blocks:", plan.blocks.length);
    process.exit(0);
  } catch (err) {
    console.error("[TimeSense-nightly] Failed to build plan:", err && (err as Error).message);
    process.exit(1);
  }
}

main();
