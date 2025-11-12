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
