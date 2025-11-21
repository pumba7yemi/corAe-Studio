# CAIA Health & Cassandra Gates

Short summary of the CAIA Health system and how it integrates with Cassandra meta-gates and the nightly green sweep.

## 150-Logic Score
- We compute a `score150` as `successRate * 150` where `successRate` is the fraction of successful decision-record entries.
- Thresholds:
  - GREEN: `score150 >= 135` and the latest nightly sweep recorded `success`.
  - AMBER: `score150 >= 100` (or missing nightly result).
  - RED: `score150 < 100` or last nightly sweep failed.

## Cassandra Gates
- Forbidden patterns are stored in `.corae/forbidden-patterns.json`.
- New patterns detected by `cassandra-meta-gate` are appended to `.corae/cassandra-meta.json`.
- Decision-record triggers detection on saves and can block / warn when forbidden patterns are present.

## Nightly Green Sweep
- The nightly runner (`tools/nightly-green-sweep.mjs`) runs `pnpm run build:verify` and records `nightly-sweep` entries.
- After a successful sweep the runner triggers the CAIA Health snapshot which writes `.corae/caia-health.json`.

## CAIA Health Engine
- Located at `corAe-Studio-v2/tools/caia-health.mjs`.
- Commands:
  - `pnpm run caia:health` (shell wrapper)
  - `node corAe-Studio-v2/tools/caia-health.mjs` (status)
  - `node corAe-Studio-v2/tools/caia-health.mjs json` (json output)
  - `node corAe-Studio-v2/tools/caia-health.mjs check` (exit codes: 0=GREEN,1=AMBER,2=RED)

## Useful Commands
- `pnpm run build:verify` — run the CAIA gate and v2 build verification.
- `pnpm run nightly:green` — run the nightly green sweep locally.
- `pnpm run caia:health` — compute and print CAIA health snapshot.
