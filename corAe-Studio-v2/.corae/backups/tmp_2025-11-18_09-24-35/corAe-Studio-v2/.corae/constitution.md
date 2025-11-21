corAe Build Constitution (non-negotiables)

1. WIP = 1: One change in flight. No new edits until typecheck + build are green.

2. DoD (definition of done):
   - tsc --noEmit PASS
   - libs build PASS
   - Studio build PASS
   - 2 demo endpoints 200

3. Single-file rule: If a change touches >1 file, split it. Each file must end green.

4. No deep imports: Only package main entries. All app code uses `@/src/*` and `@/*`.

5. Casing law: Filenames and imports lowercase by convention (e.g., devagent.ts).

6. Optional deps policy: Access via `await import()` with fallbacks (no hard bundling).

7. Freeze/Thaw: Freeze after a green build tag; only thaw for the next single change.

8. Redline gate: Stop on the first error; fix or revert before anything else.

9. Commit discipline: One commit per finished step with a DoD footer `#DoD-PASS`.

10. Demo-first: The demo endpoints are the living heartbeat. If they’re red, we stop.

This file is the source of truth for the corAe build-first flow.
corAe Build Constitution (non-negotiables)

WIP = 1: One change in flight. No new edits until typecheck + build are green.

DoD (definition of done):
- tsc --noEmit PASS → libs build PASS → Studio build PASS → 2 demo endpoints 200.

Single-file rule: If a change touches >1 file, split it. Each file ends green.

No deep imports: Only package main entries. All app code uses `@/src/*` and `@/*`.

Casing law: Filenames and imports lowercase by convention (e.g., devagent.ts).

Optional deps policy: Access via await import() with fallbacks (no hard bundling).

Freeze/Thaw: Freeze after a green build tag; only thaw for the next single change.

Redline gate: Stop on the first error; fix or revert before anything else.

Commit discipline: One commit per finished step with a DoD footer.

Demo-first: The demo endpoints are the living heartbeat. If they’re red, we stop.
