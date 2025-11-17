✅ FINAL COPILOT MESSAGE — FIX CI + BUILD + LOCK corAe-Studio v2

PASTE THIS DIRECTLY INTO COPILOT:

Apply these changes as one atomic operation (WIP=1).
Do not modify unrelated files.
Goal: Make corAe-Studio deploy successfully on Railway and ensure v2 structure.

1. Update apps/studio/package.json

Replace the entire "scripts" block with:

"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start"
}

2. Update the CI workflow .github/workflows/ci.yml

Ensure the build step uses these exact commands:

pnpm -w install
pnpm -w exec tsc -b --noEmit
pnpm -w build

If the workflow file does not exist, create it with:

name: CI

on:
  push:
    branches:
      - master
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Install
        run: pnpm -w install
      - name: Typecheck
        run: pnpm -w exec tsc -b --noEmit
      - name: Build
        run: pnpm -w build

3. Ensure Studio is using v2 structure

Verify these folders exist and create only if missing:

apps/studio/app/
apps/studio/public/
apps/studio/package.json
apps/studio/tsconfig.json

Do NOT touch any /packages or /apps/* other than Studio.

4. Commit as one message

"Fix: Studio CI + build scripts for Railway (v2 lock)"

After this, Railway should detect build scripts and deploy successfully.

If you want, I can now give you the Governor Enforcement Layer v2 Copilot message next — ready to apply.
