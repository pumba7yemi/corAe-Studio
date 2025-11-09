# CAIA — Central design notes (concise)

Purpose
-------
CAIA is the corAe Assistant/IA presence: a subtle, safe, client-side assistant that can speak, surface guided scripts, offer quick actions, and persist user preferences locally. This doc is a short plan for single-file, low-risk wiring inside `apps/studio`.

Provider location
-----------------
- `apps/studio/app/_components/caia/CaiaProvider.client.tsx` — client-only provider that exposes a minimal API on `window.__CAIA` (open/close/speak/notify/quickAction/getPrefs/setPref/getTelemetry).

Layout injection
----------------
- Mount the provider in `apps/studio/app/layout.tsx` near top-level providers so CAIA is available across pages. Use a client-only component import to avoid server-side execution.

Public API (surface area)
--------------------------
- window.__CAIA.open(): void — prepare UI focus-mode
- window.__CAIA.close(): void — exit focus-mode
- window.__CAIA.speak(text): void — speak text (uses Web Speech API if available)
- window.__CAIA.notify(message): Promise<{ok:boolean}> — no-op or stub (for later wire-up)
- window.__CAIA.quickAction(name, payload?): void — generic hook for quick actions
- window.__CAIA.getPrefs()/setPref(k,v) — local prefs store (localStorage)
- window.__CAIA.getTelemetry() — read local telemetry events

Persistence keys (local-only V1)
-------------------------------
- `caia:pref` — JSON object for user prefs (muted TTS, quick-action visibility, compact mode)
- `caia:telemetry` — array of telemetry events for local debugging
- `caia:chronological:snooze:<stepId>` — per-step snooze metadata

Accessibility contract
----------------------
- Provide a single, reachable floating control (button) with aria-haspopup and aria-expanded.
- Ensure any modal/sheet uses proper aria-modal semantics, focus trap, and returns focus after close.
- TTS controls must be opt-in and respect reduced-motion and OS-level TTS preferences.

Safety & rollout
----------------
- All initial APIs are local-only stubs; no network calls or secrets.
- Expose only a small, stable API surface on `window.__CAIA` so other client components can integrate safely.
- Incrementally add quick-actions and telemetry viewers as client-only components.

Next single-file steps (prioritized)
----------------------------------
1. Create CAIA quick-actions UI component at `apps/studio/app/_components/caia/CaiaQuickActions.client.tsx` (floating button + sheet). — LOW RISK
2. Add a short CAIA README (this file) — DONE
3. Start telemetry/prefs wiring (local-only) — small helpers inside provider exist; add a tiny UI to view/reset telemetry in the quick-actions sheet. — LOW RISK

Notes
-----
Keep all edits client-only and single-file when possible to honor build safety guardrails. When moving to server-side integrations (email, push, automations), add explicit feature flags and credential handling outside this scope.
