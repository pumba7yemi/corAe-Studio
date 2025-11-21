# TimeSense Day Engine

Overview

TimeSense builds a concrete day plan each night using onboarding-generated scripts, Have-You outputs, and 3×3 DTD artifacts. The nightly planner writes `timesense-day-plan.json` to `corAe-Studio-v2/.corae` and CAIA surfaces plan + drift in health snapshots.

Key components

- `tools/timesense-core.mts` — core types and plan builder (`buildDayPlan`, `getCurrentPlan`, `checkDrift`).
- `tools/timesense-nightly.mts` — nightly runner that collects person script tasks and generates tomorrow's plan.
- `tools/caia-health.mjs` — augmented to include `snapshot.timesense` using `timesense-core`.
- `apps/life/app/api/timesense/day/route.ts` — API route returning the current plan and drift info.
- `apps/life/components/TimeSenseBar.tsx` — small UI showing plan/drift summary.

JSON spec

See `tools/timesense-core.mts` for TypeScript interfaces. Key file: `.corae/timesense-day-plan.json` with shape `TimeSenseDayPlan` and nested `TimeBlock` entries.

Flow

1. Onboarding generates/updates person scripts under `persons/<slug>/` via the person script builder.
2. Nightly sweep runs `timesense-nightly.mts` (via `tools/nightly-green-sweep.mjs`) to build tomorrow's plan.
3. CAIA health (`tools/caia-health.mjs`) reads the plan and `checkDrift()` to include timesense in the snapshot.
4. Life UI retrieves health and renders `TimeSenseBar`.
