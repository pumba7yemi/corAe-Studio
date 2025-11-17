# Maintenance: Home & Work (corAe)

This document is a light-weight maintenance checklist for Home & Work subsystems inside the corAe monorepo.

## Daily
- Pull main, run `pnpm i` (from workspace root), and run `pnpm -r build`.
- `pnpm --filter @corae/studio build` to validate studio artifacts.
- `pnpm run lint:all` and `pnpm run typecheck:all`.
- Prisma drift check + migrate dev when schema changes are introduced.

## Weekly
- Review Have-You stops, diary templates, Reserve/Bookings.
- Regenerate Wizards (Home TimeSense, WorkFocus) if schema changed.
- Sync message templates (CIMS ↔ WhatsApp mirror).

## Monthly
- Bump schema versions in home-core / workfocus-core.
- Archive old seeds and rotate feature flags.

## Rules
- One file at a time; white-label only extends (no core overwrites).
- OBARI mapping required for any new flow.
- FileLogic forward-only: prefer adding new files rather than editing historical final files.

## Quick commands (run from repo root where appropriate)
- Install deps: `pnpm install`
- Full maintenance runner (from apps/studio): `node ./scripts/onebuild/maintenance.mjs`
- Studio build: `pnpm --filter @corae/studio build`
- Ship build: `pnpm --filter @corae/ship build`

---
Notes
- These artifacts live inside `apps/studio/` so the Studio owner can run maintenance without editing repo root files.
