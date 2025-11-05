## 150% Logic Failsafe (auto when idle >120s)

- If no human reply in 120s, apply 150% Logic:
  - Pick next safest single-file task (see README.150-percent.md).
  - Change → Build → Keep/Revert → Log.

Optional extra (WhatsApp at 60s):
- At 60s of idle, inform the on-call owner via WhatsApp that the repo is idle and 150% Logic may run at 120s. This step is optional and requires an authenticated messaging hook (NOT included here). If you enable it, ensure credentials are stored out-of-repo and the message is: "corAe Studio idle — 150% Logic may perform a safe single-file update in 60s unless you respond."