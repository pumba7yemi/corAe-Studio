# corAe GOVERNANCE (Single Source of Truth)

This folder is the canonical governance organ ABOVE all OS layers.

- core/      → machine/runtime governance JSON
- subject1/  → Subject 1 intent, laws, philosophy (markdown)
- tools/     → governance engines (audit, log, input guards, ship guards)
- api/       → shared governance handlers imported by Studio/Ship routes
- console/   → Studio UI helpers / components
- bridge/    → read-only loaders for Home/Work/Business/Ships
- ships/     → per-ship governance configs written by onboarding

No governance logic should live outside this folder except:
- thin import shims,
- Next.js route wrappers,
- CI workflow files.

All OS layers READ from here.
Only Studio console edits via API.
