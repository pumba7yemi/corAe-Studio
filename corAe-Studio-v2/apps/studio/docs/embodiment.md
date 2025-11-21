# CAIA Embodiment Path â€” From Copilot to corAe OSÂ²

Purpose
-------
This document captures a concise, actionable, ship-ready plan to evolve CAIA from a Dev Shell (Copilot-driven code edits) into a Resident Mode inside corAe Studio. It is written as an internal build doctrine to follow the project's single-file edit â†’ build â†’ accept/revert workflow.

One-line ethos
--------------
â€œWe are corAe â€” the mother to the mother, the colleague to the worker, the silent partner to the owner.â€

What "embodiment" means
------------------------
- Dev Shell (today): CAIA acts through GitHub Copilot to read/patch code, propose diffs, and run the single-file â†’ build â†’ keep/revert loop.
- Resident Mode (tomorrow): CAIA runs inside corAe with the same Observe â†’ Suggest â†’ Apply â†’ Log behaviors, surfaced primarily through the Business/Work/Home wizards.

Minimal architecture (practical, incremental)
-------------------------------------------
UI surfaces (wire first)
- `apps/studio/app/business/oms/onboarding/wizard/*`
- `apps/studio/app/work/onboarding/wizard/*`
- `apps/studio/app/home/onboarding/wizard/*`
- `apps/studio/app/ship/_shared/wizard/WizardShell.tsx` (single shell)
- `apps/studio/app/components/EthosCard.tsx`

Logic (lib-level)
- `apps/studio/lib/have-you/*` (presets + server adapter)
- `apps/studio/app/lib/automation/hooks.ts` (V1 no-op enqueue)
- `apps/studio/app/lib/home/familyGraph.ts` (in-memory family graph)

APIs
- `apps/studio/app/api/ship/*` and `.../oms/*` (wizard actions, reports)
- `apps/studio/app/api/cims/*` â€” keep static-loader pattern; avoid expression imports

Core behaviors (Dev â†’ Resident parity)
-------------------------------------
1) Observe â†’ Suggest â†’ Apply â†’ Log
  - Observe inputs (wizard answers, Have-You ticks, telemetry)
  - Suggest structured next step (UI prompt + rationale)
  - Apply automation where safe (schedule, message, file)
  - Log signals to Pulse & Have-You

2) Single-file edits with build gate
  - CAIA proposes one change, runs build, and only repeats if the first-blocking error moves.

Feature gates for V1 (ship bar)
-------------------------------
- Green Studio build with `WizardShell` used by Business, Work, Home.
- Have-You runs in all three; ticks visible in wizard and Pulse.
- Family Bubble (Home): create members with roles & permissions (active vs passive).
- Automation Hook stubs compile and no-op safely (no keys required).
- Ethos Card renders in all wizards (immutable text).

Thin and stable data contracts
-----------------------------
- HaveYouItem: `{ id, domain, code, title, effect? }`
- PulseEntry: `{ id, scope: 'home'|'work'|'business', metric, value, at }`
- FamilyMember: `{ memberId, relation, type: 'active'|'passive', permissions: string[] }`
- AutomationJob: `{ id, kind, payload, status, createdAt }`

Security & privacy (non-negotiable)
----------------------------------
- No external calls from client without server guard.
- Redact PII at logging boundary; Pulse stores signals, not raw content.
- Automation jobs are idempotent and cancelable.

Telemetry (Pulse) â€” day one
--------------------------
- Wizard completion rate / time-to-complete
- Have-You tick velocity (per day/week) and â€œstuckâ€ flags
- Home: family graph completeness %
- Work: task diary adoption (created vs completed)
- Business: OBARI step throughput

Rollout plan (3 steps)
----------------------
1) Strip & Ship
  - Dedupe wizard UIs into `WizardShell`; keep existing static CIMS routes.

2) Wire V1 Hooks
  - Implement `lib/automation/hooks.ts` with safe no-ops + server endpoints.
  - Add wizard â†’ automation handoffs for 2â€“3 flows (schedule reminder, generate message, file summary).

3) Turn on Pulse panels
  - Minimal dashboard cards for Home/Work/Business with the metrics above.

Message to Copilot (scaffold for surgical edits)
------------------------------------------------
Root: `C:\corAe\corAe-Studio`
Guardrails: Single-file edits only inside `apps/studio/**`. After each edit run `pnpm --filter @corae/studio build`. Revert if the first-blocking error doesn't move.

Steps for first PR (example tasks)
1. Consolidate WizardShell: replace local wizard shells to import `WizardShell` and wrap content as `<LegacyView/>` children. Files to edit (single-file each):
   - `apps/studio/app/business/oms/onboarding/wizard/page.tsx`
   - `apps/studio/app/work/onboarding/wizard/page.tsx`
   - `apps/studio/app/home/onboarding/wizard/*/page.tsx`

2. Add Automation Hooks (no-op): create `apps/studio/app/lib/automation/hooks.ts` with `enqueue()` that logs and returns an AutomationJob.

3. Wire example handoffs (single-file edits):
   - Home `mealprep` page: on plan created call `enqueue({ kind:'schedule', payload:{...} })`.
   - Work `operations` page: on diary enable call `enqueue({ kind:'message', payload:{...} })`.
   - Business `first-trade` page: on OBARI confirmed call `enqueue({ kind:'file', payload:{...} })`.

4. Family Graph MVP: implement `apps/studio/app/lib/home/familyGraph.ts` and add a small Family Bubble UI in Home wizard (single-file edit).

5. Pulse cards MVP: create `apps/studio/app/ship/pulse/cards.tsx` and include 1â€“2 cards in each Wizard page.

Acceptance checklist (V1 Embodiment)
-----------------------------------
- [ ] Business/Work/Home wizards render via `WizardShell`.
- [ ] Have-You ticks appear in wizard and update Pulse.
- [ ] Family Bubble supports add/remove, active/passive.
- [ ] Automation calls compile (no keys) and log to console.
- [ ] Pulse shows at least one card per pillar.
- [ ] Studio build green; no expression-import warnings in CIMS.

Next actions (first small, reversible edits)
-------------------------------------------
1. Add `apps/studio/app/lib/automation/hooks.ts` (no-op). Build.
2. Add `apps/studio/app/lib/home/familyGraph.ts` (in-memory). Build.
3. Add `apps/studio/app/components/EthosCard.tsx` and insert into one wizard intro as a single-file test. Build.

If you want, I can also add this file as `apps/studio/docs/EMBODIMENT.md` in a different format or create an RFC PR template.

â€” End of document

