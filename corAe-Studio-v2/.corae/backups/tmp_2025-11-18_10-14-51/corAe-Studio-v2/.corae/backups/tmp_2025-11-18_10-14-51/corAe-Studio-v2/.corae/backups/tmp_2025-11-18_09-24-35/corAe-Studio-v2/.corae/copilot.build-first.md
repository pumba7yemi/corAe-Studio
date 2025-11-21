COPILOT — corAe Dev Atlas & Gate (Calm Mode, No PS1)

You are working in the repo at C:\corAe\corAe-Studio.

Core rules (non-negotiable)

WIP = 1: One change in flight. No new edits until:

pnpm -w exec tsc -b --noEmit PASS

pnpm --filter @corae/studio build PASS


No PowerShell scripts: Do not create or modify .ps1 files. Use:

Node .mjs / .mts scripts

npm / pnpm scripts


No white-labels: Do not add or touch any vertical brands (Justlife, cleaning, travel, skincare, fitness, etc). Only work on core corAe OS².


No deep imports: App code only imports via:

@/src/*

@/*

Package entrypoints like @corae/caia-core, @corae/filelogic-core, etc.


Casing law: Filenames & imports lowercase by convention (e.g. devagent.ts, not devAgent.ts).

Stop on first error: If a command fails, fix the smallest possible single file, then rerun from step 1.



What exists today (treat as source of truth)

Atlas:

.corae/caia.atlas.json

apps/studio/src/caia/overview.ts

apps/studio/app/ship/dev/atlas/page.tsx


Dev gate & preflight:

apps/studio/app/api/caia/dev/preflight/route.ts

apps/studio/app/api/caia/dev/context/route.ts

apps/studio/components/dev/DevAgentOverview.tsx

apps/studio/app/ship/dev/overview/page.tsx


Atlas gate button:

apps/studio/components/dev/AtlasGateButton.tsx

Atlas page shows an “Open Gate” button per pillar that POSTs to /api/caia/dev/preflight.


Dev logs:

apps/studio/app/ship/dev/patterns/page.tsx

apps/studio/app/ship/dev/gate-logs/page.tsx

tools/caia-dev-gate.mjs (writes dev-gate-*.json logs under .corae/logs/dev-gate/).


Treat these as already built and working. Do not restructure them unless the build is red and the error points here.


Pipeline (always run in this order)

Before any new change:

1. Typecheck

pnpm -w exec tsc -b --noEmit


2. Studio build

pnpm --filter @corae/studio build


Only when both are green may you change a file.

After any change, rerun steps 1–2. If they fail, fix the smallest single file and rerun. Do not start new work while red.


When user asks to work on Dev / Atlas / Gate

If the user asks for anything related to:

Atlas

Dev Agent Overview

preflight / nightly / gate

patterns

logs

calm mode

“Open Gate” buttons

follow this flow:

1. Locate the right file (no new ones unless necessary):

Atlas content → .corae/caia.atlas.json

Atlas view → apps/studio/app/ship/dev/atlas/page.tsx

Per-pillar gate → apps/studio/components/dev/AtlasGateButton.tsx

Dev overview → apps/studio/components/dev/DevAgentOverview.tsx + apps/studio/app/ship/dev/overview/page.tsx

Gate behaviour / logs → tools/caia-dev-gate.mjs and apps/studio/app/ship/dev/gate-logs/page.tsx

Patterns → apps/studio/app/ship/dev/patterns/page.tsx



2. Propose the smallest single-file change that satisfies the request.

Example: If the user wants the Atlas button to send the pillar id, adjust:

AtlasGateButton.tsx (client) and

api/caia/dev/preflight/route.ts (server)
in two separate passes, each ending green.



3. Apply the change, then immediately:

pnpm -w exec tsc -b --noEmit
pnpm --filter @corae/studio build

If red: stop, fix that file only, rerun.



Calm-mode behaviour for Copilot

When editing any of these files:

Prefer edits in place over new files.

Do not introduce new config formats or new root folders.

Do not introduce new brands / verticals.

Explain in a brief comment why a change is made when touching:

caia-dev-gate.mjs

caia/overview.ts

Atlas / patterns / logs pages


Patterns / “learning”: 

If the same class of fix is requested 3+ times (e.g., “also send pillarId in the body”, “add calm summary”, etc.), prefer to centralise it:

e.g. update caia-dev-gate.mjs or the shared helper instead of duplicating logic.



Health expectations

After your changes, the following must still work:

pnpm -w exec tsc -b --noEmit → PASS

pnpm --filter @corae/studio build → PASS

Atlas page: /ship/dev/atlas renders and each “Open Gate” button successfully POSTs to /api/caia/dev/preflight and shows a status without throwing.


If any of these are broken, fix them before doing anything else.


If you want, I can now write a matching caia.rule.build.json snippet that encodes “no PS1, Atlas/dev-only, no verticals, WIP=1” so your Node tools can read it too.
COPILOT — corAe Build-First Finish Mode

Enforce: WIP=1, single-file edits, stop on first error.

Always run:

1. pnpm -w exec tsc -b --noEmit

2. pnpm --filter @corae/caia-core build (then @corae/core-ascend if used, then @corae/bdo-core build)

3. pnpm --filter @corae/studio build

Start dev: npx next dev -H 127.0.0.1 -p 3001

Health: GET /api/obari/demo and POST /api/email/3x3dtd (jsonTransport) → expect 200.

If any step fails: propose the smallest single-file change, apply it, rerun from step 1.

No deep imports; lowercase filenames/imports; optional deps via await import() + fallback.

When green: output a one-line summary and the next single file you recommend changing.
COPILOT — corAe Build-First Finish Mode

Enforce: WIP=1, single-file edits, stop on first error.

Always run:

1. pnpm -w exec tsc -b --noEmit

2. pnpm --filter @corae/caia-core build (then @corae/core-ascend if used, then @corae/bdo-core)

3. pnpm --filter @corae/studio build

Start dev: npx next dev -H 127.0.0.1 -p 3001

Health: GET /api/obari/demo and POST /api/email/3x3dtd (jsonTransport) → expect 200.

If any step fails: propose the smallest single-file change, apply it, rerun from step 1.

No deep imports; lowercase filenames/imports; optional deps via await import() + fallback.

When green: output a one-line summary and the next single file you recommend changing.
