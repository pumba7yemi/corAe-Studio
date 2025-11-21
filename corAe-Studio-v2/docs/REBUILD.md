# Rebuild & Immutable Deployment (no PowerShell)

This document describes how to rebuild the Studio image and deploy immutable instances. PowerShell scripts are not used here.

Overview
- Build and verify locally or in CI using `pnpm`.
- Create a Docker image with a semantic tag.
- Push the image to your registry and deploy via your infrastructure tooling (blue/green or replace).

Local build (Node script)
- Run the Node helper to run checks and build the image:

  node tools/rebuild-image.mjs --tag <registry>/corae-studio:<tag> [--push]

- Example:

  node tools/rebuild-image.mjs --tag ghcr.io/yourorg/corae-studio:v2-20251119 --push

Notes
- The Node helper runs `pnpm -w exec tsc -b --noEmit` and `pnpm run -w build:verify` before building.
- The script expects `docker` to be available on the host when `--tag` is provided.
- This repo includes a safe admin enqueue API at `/api/ops/rebuild` which writes requests to `.corae/ops/rebuild-requests.json`. CI or an operator can watch that file and trigger a build job in an executor with credentials.

Admin enqueue API (safe)
- POST `/api/ops/rebuild` with JSON `{ requestedBy: "admin@example.com", note: "rebuild v2" }` to enqueue a rebuild request.
- The API does not execute shell commands; it simply records the request so that an operator/CI can take action.

CI integration
- Use the Node helper inside CI to produce signed, versioned artifacts.
- Recommended steps:
  1. Checkout repo
  2. Install deps: `pnpm i`
  3. Run: `node tools/rebuild-image.mjs --tag <registry>/corae-studio:<ci-tag> --push`
  4. Deploy image using your infra tooling (K8s/VM/VMSS/etc.)

Rollback & Blue-Green
- Maintain two clusters or instance groups; deploy new group, health-check, then switch traffic.
- Use image tags to identify releases.

Security
- The `/api/ops/rebuild` endpoint is intentionally non-executing and requires your infra to gate actual execution.
- Keep registry credentials in secured CI variables; do not store them in the repo.

If you want, I can:
- Add a small CI workflow (GitHub Actions) that runs the Node helper and pushes images.
- Add a small watcher script that runs on an admin host to process `.corae/ops/rebuild-requests.json` and run the Node helper (requires careful ops/auth setup).
