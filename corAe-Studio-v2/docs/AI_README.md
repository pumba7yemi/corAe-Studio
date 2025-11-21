# corAe OS² — Build Map (for Copilot)
Monorepo: apps/studio (Next.js 15), packages/* (core libs).
Goals (high priority):
1) CAIA Memory in packages/caia-core (pure TS), imported by apps/studio via @corae/caia-core.
2) Next config must transpile @corae/caia-core / @corae/ui / @corae/workflows-core.
3) Prisma lives at apps/studio/prisma/schema.prisma.
4) Keep Windows/PowerShell-friendly scripts.
5) Avoid brittle shims; prefer typed libs in packages/* with dist/index.js + .d.ts.