150-ensure: corAe "150 logic" preflight

Purpose
-------
This folder contains a conservative preflight script `150-ensure.ps1` that embodies
"150 logic": only proceed when we're more than "sure" — run checks and verify
runtime smoke tests before allowing development/start steps to proceed.

Usage
-----
From the repository root (Windows PowerShell):

    cd C:\corAe\corAe-Studio
    # run checks (will NOT kill processes unless you pass -Force)
    .\tools\ops\150-ensure.ps1 -Secret change-me

    # If you want the script to kill stale processes on required ports, add -Force
    .\tools\ops\150-ensure.ps1 -Secret change-me -Force

What it does
------------
1. Runs `pnpm --filter @corae/studio exec -- tsc --noEmit` (typecheck). Fails fast on errors.
2. Ensures `.logs/` exists.
3. Checks whether port 3000 is in use. If occupied, it refuses unless -Force is provided; with -Force, it kills the occupying pid(s).
4. Starts Ship dev in background with `SHIP_UPDATE_ADMIN_SECRET` set to the provided value.
5. Runs the smoke-runner `pnpm smoke:ship:node` and verifies the newest `smoke-*.log` contains `SMOKE_SUMMARY: {"ok":true`.
6. Ensures Studio is started and polls `/api/morning-exec` until it reports `kpis[0].value === "PASS"` (60s poll).

Notes
-----
- The script is intentionally conservative. It is designed to avoid accidental kills and destructive operations unless you explicitly pass `-Force`.
- It's Windows/PowerShell focused. For cross-platform automation we can add a Node wrapper later.
- This is a first-safe iteration of "150 logic". We can extend it with stricter checks (lint, tests, unit test run, signed commit checks, etc.).

Feedback
--------
If you want the script to be more or less aggressive (for instance auto-restarting servers, capturing logs to files, or running in CI), tell me which behaviors to add and I will implement them.
