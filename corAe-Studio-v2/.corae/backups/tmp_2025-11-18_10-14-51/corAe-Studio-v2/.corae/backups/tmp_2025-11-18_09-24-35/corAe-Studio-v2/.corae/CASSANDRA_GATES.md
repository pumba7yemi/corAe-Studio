Cassandra Companion Mode - Gates

Purpose:
- Describe Cassandra Companion Mode and the gate thresholds used to enable conservative companion behavior.

Background:
- The CAIA "150% logic" gate uses a decision-memory score computed as `score150 = successRate * 150`.
- When a subject's `score150` falls below configured thresholds the system may engage a conservative companion mode ("Cassandra") that forces more explicit confirmation and safer behaviors.

Rules:
- Default gate threshold: `140` (this is used by the CAIA gate and CLI helpers).
- Cassandra Companion Mode is considered enabled for a subject when `score150 < minScore`.
- When Cassandra is enabled agents must prefer non-autonomous responses (advice, clarifying questions), or include explicit decision annotations if an autonomous action is taken.

Operational Notes:
- Decision memory is stored in `.corae/decision-memory.json` in the v2 workspace and managed by `tools/decision-record.mjs`.
- Use `tools/decision-record.mjs metrics <subject> --json` to inspect metrics for a subject.
- Module `packages/caia-core/src/cassandra.ts` provides helpers to read these metrics and to check if Cassandra mode should be applied.

Change Control:
- This charter lives in v2 only. Any changes should be coordinated with the CAIA team and gate maintainers.
