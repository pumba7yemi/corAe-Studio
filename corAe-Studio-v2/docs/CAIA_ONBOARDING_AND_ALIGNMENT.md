# CAIA Onboarding and Alignment

This document explains the CAIA onboarding wizard, daily pulse, alignment engine, and how nightly sweep ties in.

## Onboarding
- `/api/caia/onboarding` returns a small script describing CAIA identity and how to interact.
- The onboarding wizard at `/onboarding/caia` guides users through 5 steps and stores completion in `localStorage`.

## Daily Pulse
- The `CaiaDailyPulse` component prompts the user once per morning (after 6am) to report `good|ok|stressed|unwell`.
- Results are posted to `/api/caia/daily` and stored in `corAe-Studio-v2/.corae/user-daily-check.json`.

## Alignment Engine
- `corAe-Studio-v2/tools/caia-alignment.mjs` compares CAIA health, user daily checks, and Cassandra patterns.
- It exits `0` when aligned, `1` when misaligned and prints a recommendation JSON.

## Nightly Integration
- The nightly runner spawns CAIA health snapshot and then runs the alignment tool. If misaligned, it records a `nightly-sweep` alignment entry to decision memory.

## Commands
- `pnpm run build:verify`
- `pnpm run nightly:green`
- `pnpm run caia:health`
- `node corAe-Studio-v2/tools/caia-alignment.mjs`
