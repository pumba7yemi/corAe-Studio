WhatsApp notify stub (apps/studio/app/lib/notify)

This folder contains a safe, no-op WhatsApp notify stub used during development and for 150% Logic automated steps.

Files
- whatsapp.ts — `notifyOnCall(message:string)` async function that logs the message and returns `{ ok: true }`.

Wiring a real provider
1. Keep credentials out of repo. Use environment variables or a secret manager (e.g., process.env.WHATSAPP_API_KEY).
2. Replace the body of `notifyOnCall` with your provider's SDK or HTTP call.
3. Ensure calls are resilient (timeouts, try/catch) and fail closed (never expose secrets to logs).

Example:

import { notifyOnCall } from './whatsapp';
await notifyOnCall('Studio build succeeded — new change committed');
