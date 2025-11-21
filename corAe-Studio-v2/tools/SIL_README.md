# Structural Intelligence Layer (SIL)

SIL prevents duplicate domains such as:
- want vs iwant
- tasks vs 3x3 vs todo
- booking vs order vs obari

How it works:
1. Loads `sil-atlas.json` from `tools/`
2. Normalizes input and matches against synonyms
3. Routes the intent to a canonical domain
4. Blocks or warns about duplicates so CAIA avoids creating conflicting pages/apIs

Files added:
- `tools/sil-atlas.json` — canonical domain synonyms
- `tools/structure-router.mjs` — routing utility
- `app/api/onboarding/route.ts` — onboarding API uses the router
- `tools/caia-build-gate.mjs` — small gate helper for build flows
