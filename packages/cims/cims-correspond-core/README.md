# CIMS Correspond™

The Intelligent Correspondence Engine for CIMS™.

- Learns each conversation (90-parameter signature)
- Auto-replies when similarity ≥ 0.90
- Dual-suggests when 0.75–0.89
- After 3 no-edit approvals → Auto Mode

## 🧩 Usage

```ts
import { processInboundEmail, confirmResponse } from "@cims/cims-correspond-core";