🧩 150% Logic — corAe Studio

What is 150% Logic?

A tiny operating rule for corAe builds: make only changes you’re certain won’t break the green state. One file, one step, prove it with a build. If it doesn’t advance, revert.

Guardrails (strict)

- Only edit files under `apps/studio/**`.
- No dependency installs.
- No edits to node_modules, .next, .env*, or lockfiles.
- Prefer single-file surgical edits, then run:

  pnpm --filter @corae/studio build

- Keep the file only if the build advances or stays green. Revert otherwise.
- Log what you changed (1–3 lines) in `apps/studio/app/build-log/LATEST.md` with timestamp.

How to choose the next step (150% Logic)

1. Read `TODO.md` (or `/apps/studio/TODO.md`) and pick the highest-confidence task that:
   - Is self-contained; affects one file; doesn’t need new deps.
   - Reduces warnings or removes duplication; or resolves an obvious SSR/CSR/lint friction.

2. If TODO is unclear, run a read-only scan (no writes) of likely hotspots:
   - `apps/studio/app/**/wizard/**`
   - `apps/studio/app/api/**` (computed imports → static + safe fallback)
   - `apps/studio/app/**/page.tsx` using `use client` / `dynamic = 'force-dynamic'` patterns

3. Apply one minimal change. Build. Keep/Revert per rule. Append a 1–3 line log entry.

Priority order (pick the top present item)

(A) Replace expression-based dynamic imports in API routes with “static attempts + safe fallback”.

(B) Wrap server pages correctly or move client code behind `use client` / `export const dynamic = 'force-dynamic'`.

(C) Remove duplicate shells/components by routing via the shared versions (e.g., `WizardShell`).

(D) Fix lint that blocks build (e.g., `<a>` → `<Link>`, hooks order) in one file at a time.

(E) If no code change needed, document (update `README.150-percent.md` or TODO with concrete next steps).

Commit/revert message format

- Keep (when build passes or advances):
  `chore(studio): 150%-logic — <one-line change>  [single-file, build-pass]`

- Revert (when build doesn’t advance):
  `revert(studio): 150%-logic — <one-line change>  [no build advance]`

Log format (apps/studio/app/build-log/LATEST.md)

[YYYY-MM-DD HH:mm] file: <relative/path>
Change: <1 sentence>
Result: build PASS | build advanced | reverted

Examples

✅ Replace `import()` with `try { await import('…/messages') } catch { useLocal() }` in one route → build passes.

✅ Add `export const dynamic = 'force-dynamic'` to a server page that mounted a client component → build passes.

❌ Touch 6 files to “clean things up” → reject (not one-file surgical).


Selection order (when unsure)

1. API routes: replace computed imports with static attempts + safe fallback.
2. SSR/CSR friction: add `dynamic = 'force-dynamic'` or move client code behind `use client`.
3. De-dup shells/components (route through shared WizardShell, EthosCard).
4. Lint blockers: fix a single file (hooks order, `<a>`→`<Link>`, unescaped entities).
5. Documentation: clarify TODOs / record next safe steps.

Keep/Revert protocol

- Keep: Build advances or stays green → commit with message format above.
- Revert: Build regresses or stalls → revert the file; add a one-liner noting why.


If you want the small TODO anchor and a build-log skeleton, I’ll also add them under `apps/studio/` (README and TODO snippet + LATEST.md).