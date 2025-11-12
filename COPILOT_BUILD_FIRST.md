---

Copilot — Build-First Mode (make it work, then tidy)

Objective

nGet the entire corAe monorepo compiling, linking, and serving on http://127.0.0.1:3001 with the core endpoints/pages working. Prioritize functionality over polish. Create minimal stubs where needed. Report after each checkpoint.

Non-negotiables

Prefer workspace builds over app-only builds.

No deep imports from package/src/* in apps; import package entrypoints only.

If an import fails, create a minimal stub package (1–2 exports) to unblock.

Keep edits small and reversible; commit per checkpoint with clear messages.

Checkpoints (stop after each and print what changed)

1. Workspace health

Ensure root: pnpm-workspace.yaml includes apps/* and packages/*.

Run: pnpm -w install → fix any obvious peer/lock issues.

Run: pnpm -w exec tsc -b --noEmit → if type errors from missing packages, stub those packages minimally (dist/index.js + types) and re-run until PASS or only real code errors remain.

Commit: chore(workspace): install + typecheck baseline.



2. Build all packages (order-aware)

Run: pnpm -r --filter "./packages/**" build.

For each package that fails: fix tsconfig, exports (main, types), or add a minimal index.ts that re-exports what apps need.

Commit: chore(packages): build all libs.


3. App boot (bind fixed host/port)

In apps/studio/package.json, set "dev": "next dev -H 127.0.0.1 -p 3001".

Run: pnpm --filter @corae/studio dev and keep it running. If it crashes on missing modules, stub them.

Commit: chore(studio): fixed dev host/port.


4. Core endpoints working

Implement or stub to 200 OK:

/api/caia/memory (uses caia-core read/write)

/api/morning-exec (mock KPIs; optional Pulse read)

/api/obari/demo (returns {ok:true,id,ts})

/api/email/3x3dtd (returns {ok:true,queued:true})

/api/social-contract/audit (append/read entries in ship memory)

/api/ascend/alignment (aligned=true when home/work/business each have ≥1 checked pledge)


Smoke (PowerShell):

iwr http://127.0.0.1:3001/api/obari/demo -UseBasicParsing
iwr http://127.0.0.1:3001/api/email/3x3dtd -UseBasicParsing
iwr "http://127.0.0.1:3001/api/caia/memory?scope=demo" -UseBasicParsing
iwr http://127.0.0.1:3001/api/morning-exec -UseBasicParsing
iwr http://127.0.0.1:3001/api/social-contract/audit -UseBasicParsing
iwr http://127.0.0.1:3001/api/ascend/alignment -UseBasicParsing

Commit: feat(api): core endpoints online.



5. Minimal pages render

/ (hub KPIs via /api/morning-exec)

/caia (links to memory + workflows)

/ship/work/ascend (gate on alignment API, basic dashboard on unlock)

/ship/*/social-contract (uses audit API; client post)

Commit: feat(ui): minimal pages wired to working endpoints.


6. Production build sanity

Run: pnpm --filter @corae/studio build. If failing due to missing optional packages, gate dynamic imports with try/catch or conditional client-only loads.

Commit: chore(build): prod build passes.



If blocked

Missing import → create stub package in packages/<name> with dist/index.js/index.d.ts exporting only required symbols; add "main", "types", and a tiny tsconfig.json; build it; continue.

Client/server mismatch → move "use client" to a leaf component; keep pages server components.

ESM externals → avoid deep subpaths; use package entrypoint.


Finish criteria

Dev server on 127.0.0.1:3001.

All six endpoints return 200.

Core pages render without runtime errors.

pnpm --filter @corae/studio build completes.

Post a final summary of stubs added and TODOs to replace them.


**Begin with Checkpoint 1 now. Stop and report after each checkpoint.**
