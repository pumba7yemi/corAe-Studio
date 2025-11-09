// app/lib/automate/scheduler.ts
import { listByTenant, runStepById } from "./store";
import type { Workflow } from "./types";
import { cronMatchesNow } from "./cronMatch";

type TenantID = string;

// prevent duplicate runs within the same minute
const ranKey = (tenant: string, wfId: string, stepId: string, y: number, mo: number, d: number, h: number, mi: number) =>
  `${tenant}:${wfId}:${stepId}:${y}-${mo}-${d}T${h}:${mi}`;

const SEEN = new Set<string>();
let started = false;
let timer: NodeJS.Timeout | null = null;

async function tickTenants(tenants: TenantID[]) {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth() + 1;
  const d = now.getDate();
  const h = now.getHours();
  const mi = now.getMinutes();

  for (const tenant of tenants) {
    const wfs: Workflow[] = await listByTenant(tenant);
    for (const wf of wfs) {
      for (const st of wf.steps) {
        if (st.trigger?.type !== "time") continue;
        const expr = st.trigger.expr;
        if (!expr) continue;

        if (cronMatchesNow(expr, now)) {
          const key = ranKey(tenant, wf.id, st.id, y, mo, d, h, mi);
          if (SEEN.has(key)) continue; // already fired this minute
          SEEN.add(key);

          // fire & forget (log errors)
          runStepById(tenant, wf.id, st.id).catch((e) =>
            console.error("[scheduler] run error", { tenant, wf: wf.id, step: st.id, error: e?.message || e })
          );
        }
      }
    }
  }

  // garbage collect keys older than 120 entries to avoid unbounded growth
  if (SEEN.size > 2000) {
    const keep = new Set(Array.from(SEEN).slice(-1200));
    SEEN.clear();
    keep.forEach((k) => SEEN.add(k));
  }
}

export function startScheduler(tenants: TenantID[] = ["demo"]) {
  if (started) return;
  started = true;
  // align to next minute boundary
  const now = new Date();
  const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  setTimeout(() => {
    tickTenants(tenants);
    timer = setInterval(() => tickTenants(tenants), 60_000);
  }, Math.max(0, delay));
  console.log("[scheduler] started for tenants:", tenants.join(", "));
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
  started = false;
  SEEN.clear();
}