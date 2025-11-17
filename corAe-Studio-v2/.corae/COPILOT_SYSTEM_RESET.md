🟦 COPILOT — SYSTEM RESET & STRUCTURE SYNC (v2 ONLY)

Copilot, update your understanding of the current codebase:

✔ ROOT DIRECTORY

The correct project root is:

C:\corAe\corAe-Studio-v2

All work must happen inside this directory only.
Completely ignore:

corAe-Studio

any v1 folders

any legacy ship/studio structures


✔ APPS STRUCTURE (v2)

Inside apps/, the correct apps are:

apps/
  life/          (this replaces ship)
  work/
  home/
  business/
  studio/ (tools only, NOT the main app)
  shipyard/
  dockyard/

Life is now the corridor app (formerly “ship”).

✔ NEXT.JS TARGET

The only app we run in dev is:

@corae/life

Use:

pnpm --filter @corae/life dev

✔ WHAT YOU MUST DO FROM NOW ON

Treat apps/life as the new core front-end.

Treat apps/studio as internal tools (NOT runnable as a product).

Treat apps/shipyard and dockyard as infrastructure tooling only.

NEVER reference or modify anything in corAe-Studio (v1 root).

NEVER recreate ship unless instructed; Life replaces Ship.


✔ YOUR ROLE

From this point forward:

Help me migrate features from the old ship into apps/life.

Help clean and reorganize anything inside /apps to match the new OS structure.

Help rewrite API routes inside apps/studio and point them to apps/life.

Validate every file move before performing it.

Never touch v1.


✔ CONFIRMATION

Reply confirming you now understand:

the correct root

the v2-only workspace

the new apps folder layout

that Life is the corridor OS

that Studio is not the main app

that v1 must be ignored forever

