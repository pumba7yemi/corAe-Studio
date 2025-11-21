✅ COPILOT MESSAGE — CONFIRM V2 RESET + BEGIN CLEANUP (Option A)

Paste this into GitHub Copilot Chat exactly as written:

---

COPILOT — CONFIRM V2 RESET

I have uploaded the v2 reset files.
Please confirm:

“Workspace reset to v2. No v1 references remain.”

When confirmed, proceed with the following tasks in order:

1. Clean and stabilise the v2 workspace

Remove all v1 residue or references in any directory.

Ensure the active workspace root is:
C:\corAe\corAe-Studio-v2

Validate that all package.json, pnpm-workspace.yaml, tsconfig.base.json and all configs point ONLY to v2.


2. Fix routing and trench-corridor structure

Make /apps/life/ a clean exported app.

Ensure no ship/shipyard/dockyard files remain inside Studio.

Fix all import paths so Life compiles.


3. Make Life buildable

Ensure all required folders exist:
/apps/life/app, /apps/life/app/page.tsx, /apps/life/api/*

Remove any leftover ship or studio v1 API routes.


4. Run:

pnpm -w install
pnpm -w exec tsc -b --noEmit

5. Report back:

Typecheck status

Install status

Any remaining v1 traces


Wait for my approval before applying any further modifications.

End of message.

---

Paste that into Copilot, let it reply, then send me the Copilot confirmation reply and I’ll take us to the next step.

We’re close.
