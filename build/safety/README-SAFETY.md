# 🛡️ corAe Write Safety

This folder defines the **safety rails** for all build actions inside corAe.  
It protects **Dockyard**, **CAIA Prime**, and **White-Label Ships** from being overwritten.

---

## 🔒 Protected Policies

### 1. `protected-paths.json`
- Guards the **Dockyard** and **core brain**:
  - `apps/studio/app/dockyard/**`
  - `apps/studio/lib/build/**`
  - `apps/studio/lib/caia/**`
  - `apps/studio/app/api/build/log/**`
  - and other critical files (theme engine, workflows, configs)
- These paths can **never** be overwritten directly.
- Allowed modes: `APPEND`, `SKIP_IF_EXISTS`, `ERROR_IF_EXISTS`.
- Any overwrite requires:
  - A **backup snapshot** (timestamped)
  - A **Build Log event** (`BLOCK_WRITE_PROTECTED` if refused)

### 2. `white-label-protected.json`
- Guards each **client Ship** (Supermarket, Hotel, Salon, Fitness, Cleaning, Golf Club).
- Prevents one tenant’s CAIA from overwriting another tenant’s code.
- Examples:
  - `apps/studio/app/ship/supermarket/**`
  - `apps/studio/app/ship/hotel/**`
  - `apps/studio/app/ship/salon/**`
- Same write rules: only APPEND/SKIP/ERROR_IF_EXISTS.

---

## 🧰 How It Works
1. **Safe Writer** (`scripts/onebuild/safe-writer.js`) checks these files before writing.
2. If a write would violate policy:
   - The operation is **blocked**.
   - A `BLOCK_WRITE_PROTECTED` event is logged in **Build Log**.
3. **Backups**:
   - Every overwrite allowed by policy creates a snapshot in:
     ```
     build/backups/<timestamp>/<path>
     ```
4. **Checksums**:
   - After every write, hashes are updated in:
     ```
     build/logs/checksums.json
     ```

---

## 🧪 Dry-Run Mode
Preview any manifest without touching disk:
```bash
ONEBUILD_DRY_RUN=1 node scripts/onebuild/run.js