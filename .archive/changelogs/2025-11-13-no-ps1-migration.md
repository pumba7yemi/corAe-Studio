# 2025-11-13 — No .ps1 Migration

Summary
-------
Migrated repository automation from PowerShell (.ps1) to Node-based runners and `pnpm` scripts. Enforced `noPS1` policy in the dev gate and archived original `.ps1` files under `.zzzold/ps1/`.

Highlights
----------
- Enforced `noPS1` in `tools/caia-dev-gate.mjs` (policy violations now fail the gate).
- Added cross-platform Node runners under `tools/` and `scripts/` for preflight, nightly, maintenance, and smoke flows.
- Updated `package.json` with convenient `pnpm` aliases to preserve developer muscle memory.
- Updated docs and VS Code tasks to use Node runners instead of PowerShell.
- Left original `.ps1` scripts archived at `.zzzold/ps1/`.

Testing
-------
- `pnpm -w exec tsc -b --noEmit` — OK
- `pnpm --filter @corae/studio build` — OK

