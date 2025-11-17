// apps/studio/app/system/readme.md
# ⚙️ corAe System Registry

The **System Registry** is the backbone of **corAe OS²**.

---

## 📦 Purpose
To maintain and introspect all running **corAe Engines™** — each a self-contained module such as:
- **Reserve™** (Marketplace BDO/BTDO hub)
- **CIMS™** (Messaging Core)
- **OBARI™** (Order → Invoice Engine)
- **Finance™**, **Work OS**, and others

---

## 🧭 Responsibilities
| Layer | Role |
|--------|------|
| `registry/engines.ts` | Static engine manifests |
| `registry/register.ts` | Runtime registration & summary |
| `boot.ts` | Engine boot and startup logic |
| `diagnostics.ts` | Health and integration reporting |
| `api/system` | REST endpoints for system-level data |

---

## 🚀 Usage
### Register an Engine
```ts
import { registerEngine } from "@/app/system/registry/register";
registerEngine(MyEngineManifest);