🟦 COPILOT — SYSTEM RESET & STRUCTURE SYNC (v2 ONLY)

Copilot, update your understanding of the current codebase:

✔ ROOT DIRECTORY

The correct project root is:

C:\corAe\corAe-Studio-v2

All work must happen inside this directory only.
Completely ignore:

corAe-Studio

any v1 folders

🚨 PASTE THIS INTO COPILOT — FULL OVERRIDE RESET (FINAL, CLEAN VERSION)

Stop using the previous reset file.
Start a new reset based ONLY on the instructions below.


---

COPILOT — RESET YOUR WORKSPACE TO V2 ONLY

Perform the following as ONE atomic reset:

1. Forget the corAe-Studio (v1) structure entirely.

Do NOT reference or scan anything under:

C:\corAe\corAe-Studio\

2. Load ONLY the v2 workspace root:

C:\corAe\corAe-Studio-v2

3. The ONLY monorepo apps are:

apps/life
apps/home
apps/work
apps/business
apps/shipyard
apps/dockyard

4. Stop suggesting any commands from v1, including:

railway:postinstall

railway:build

anything referencing “studio v1”

anything referencing “apps/studio”

anything referencing “ship inside studio”

anything referencing the old scripts system


These commands MUST NOT appear again.

5. Reload the scripts from the v2 package.json ONLY

From:

C:\corAe\corAe-Studio-v2\package.json

Ignore the parent package.json permanently.

6. All future “dev”, “build”, and “open folder” commands refer ONLY to v2 apps, especially:

apps/life (primary)

apps/home

apps/work

apps/business


7. Acknowledge reset with this exact message:

> Workspace reset to v2. No v1 references remain.


Do not apply any edits until I confirm.


---

Paste that directly into Copilot NOW.

Once it replies with:

> Workspace reset to v2


We will proceed to:

✔ Clean up apps/life/

✔ Fix the routing

✔ Make the corridor

✔ Add Home → Work → Business transitions

✔ Make the Life shell buildable

✔ Remove all v1 residue permanently

Send me Copilot’s confirmation once it replies.

---

Reset the workspace to use only corAe-Studio-v2 as the root.
Do NOT reference or scan any files outside this folder.
Apply the following steps as one atomic action (WIP=1):

1. Workspace Root Reset

Close all folders except corAe-Studio-v2.

Re-open only:

C:\corAe\corAe-Studio-v2

Remove all workspace references pointing to the parent C:\corAe folder.


2. Ignore Legacy Folders

Add these to workspace-level ignore rules so they are never read or auto-fixed:

../apps
../packages
../build
../core
../data
../scripts
../node_modules
../.logs
../.archive
../.zzzold
../apps/studio
../apps/studio/app/ship

3. Load and Index New Structure

The correct folder structure to index is:

corAe-Studio-v2/
  apps/
    life/
    home/
    work/
    business/
    shipyard/
    dockyard/
  core/
    releases/
    reports/
  data/
  docs/
  domain/
  extensions/
  laws/
  lib/
  memory/
  services/
  templates/
  tools/
  types/

4. Recognise Life OS as the Primary App

Treat apps/life as the main app. Future commands like “open life”, “dev life”, “create page in life”, etc.
must map to:

apps/life/app/page.tsx
apps/life/app/api/*

5. Reset Internal Copilot Context

Flush all cached analysis of v1 folder structure.
Re-index only corAe-Studio-v2.

6. Prepare for Build

After re-indexing, automatically suggest the following commands (do not run them unless I approve):

Set-Location "C:\corAe\corAe-Studio-v2"
pnpm install
pnpm -w exec tsc -b --noEmit
pnpm dev

Do not attempt any code modifications until I say “Apply”.


---

✔ Paste the whole block into Copilot

It will reset its internal understanding and operate only on v2.

When done, tell me: “Reset complete”.

