# PR: Enforce noPS1 — migrate automation to Node runners

Summary
-------
This PR finalizes the migration away from PowerShell (.ps1) automation to cross-platform Node runners and `pnpm` scripts. It enforces the `noPS1` policy in `tools/caia-dev-gate.mjs`, archives original `.ps1` helpers under `.zzzold/ps1/`, and updates docs/configs to reference the new Node runners.

What changed
------------
- Added/updated Node runners under `tools/` and `scripts/` (e.g., `tools/caia-preflight.mjs`, `tools/nightly-green-sweep.mjs`, `apps/studio/scripts/onebuild/maintenance.mjs`, `scripts/caia-tidy.mjs`, etc.).
- Updated root `package.json` with convenience scripts: `caia:preflight`, `caia:nightly`, `ship:smoke`, `dev:ship`, `check`, and others.
- Extended `tools/caia-dev-gate.mjs` to detect `.ps1` files and textual references and fail when `buildRules.enforce.noPS1 === true`.
- Archived original PowerShell helpers to `.zzzold/ps1/` (non-destructive) and added DEPRECATED headers where applicable.
- Replaced textual references to PowerShell in key docs/configs (notably `apps/studio/.vscode/tasks.json` and `apps/studio/docs/MAINTENANCE_HOME_WORK.md`).

Archived .ps1 files (kept for reference):
- `.zzzold/ps1/create-signin-structure.ps1`
- `.zzzold/ps1/tools/caia-preflight.ps1`
- `.zzzold/ps1/tools/corAe-dev.ps1`
- `.zzzold/ps1/tools/nightly-green-sweep.ps1`
- `.zzzold/ps1/tools/ops/150-ensure.ps1`
- `.zzzold/ps1/tools/scaffold.corae-manual.ps1`
- `.zzzold/ps1/tools/ship/run-smoke.ps1`
- `.zzzold/ps1/tools/ship/start-dev-and-smoke.ps1`
- `.zzzold/ps1/scripts/caia-tidy.ps1`
- `.zzzold/ps1/scripts/mkr-btdo.ps1`
- `.zzzold/ps1/scripts/precommit.ps1`
- `.zzzold/ps1/scripts/schedle-haveyou.ps1`
- `.zzzold/ps1/apps/studio/scripts/onebuild/maintenance.ps1`

Testing & verification
----------------------
Run these locally (PowerShell):

```powershell
pnpm -w exec tsc -b --noEmit
pnpm --filter @corae/studio build
pnpm caia:preflight
pnpm caia:nightly
```

Notes
-----
- This PR does not delete archived `.ps1` files; they are left under `.zzzold/ps1/` for reference. If you prefer removing them entirely, we can follow up with a cleanup PR.
- If you'd like, I can open a GitHub PR for you (I can prepare branch/commit commands). Otherwise, apply and push the changes from this branch.

Reviewer checklist
------------------
- [ ] Confirm there are no remaining `pwsh`/`.ps1` references in critical docs (CI, README, deploy scripts).
- [ ] Confirm Node runners' behavior matches previous PS1 semantics where applicable.
- [ ] Approve archival or removal policy for `.zzzold/ps1/`.

