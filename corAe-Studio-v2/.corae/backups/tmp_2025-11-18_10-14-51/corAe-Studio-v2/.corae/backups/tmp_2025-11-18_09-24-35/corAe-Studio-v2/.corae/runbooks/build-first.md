corAe Build-First Runbook

Follow these steps in order. Abort on the first error.

1) Typecheck

   pnpm -w exec tsc -b --noEmit

2) Libs build (in order)

   pnpm --filter @corae/caia-core build
   pnpm --filter @corae/core-ascend build   # if used
   pnpm --filter @corae/bdo-core build

3) Studio build

   pnpm --filter @corae/studio build

4) Start dev (pinned)

   cd apps/studio
   npx next dev -H 127.0.0.1 -p 3001

5) Health checks

   GET http://127.0.0.1:3001/api/obari/demo → 200
   GET http://127.0.0.1:3001/api/email/3x3dtd → 200

6) Tag

   git tag -f demo-green && git push -f --tags

Notes:
- Keep changes single-file where reasonable.
- If a step fails, fix the minimum single-file change, then re-run from step 1.
corAe Build-First Runbook

Follow these steps exactly to run the canonical pipeline.

1) Typecheck

pnpm -w exec tsc -b --noEmit

2) Libs build (in order)

pnpm --filter @corae/caia-core build
pnpm --filter @corae/core-ascend build # if used
pnpm --filter @corae/bdo-core build

3) Studio build

pnpm --filter @corae/studio build

4) Dev (pinned)

From apps/studio:
npx next dev -H 127.0.0.1 -p 3001

5) Health

GET http://127.0.0.1:3001/api/obari/demo → 200
GET http://127.0.0.1:3001/api/email/3x3dtd → 200 (jsonTransport)

6) Tag (after green)

git tag -f demo-green && git push -f --tags
