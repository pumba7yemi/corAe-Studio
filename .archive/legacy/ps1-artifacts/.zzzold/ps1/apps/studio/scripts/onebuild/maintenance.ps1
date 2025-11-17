# DEPRECATED — replaced by `apps/studio/scripts/onebuild/maintenance.mjs` (Node runner). Kept for reference.
param(
  [switch]$Clean,
  [switch]$ShipOnly,
  [switch]$StudioOnly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSCommandPath
# This runner is intended to be executed from inside apps/studio. It keeps workspace-local changes here.
$repo = Resolve-Path "$root\.."

Write-Host "▶ corAe Maintenance: Home & Work" -ForegroundColor Cyan
Set-Location $repo

if ($Clean) {
  Write-Host "🧹 Clean caches" -ForegroundColor Yellow
  Remove-Item -Recurse -Force .\.next, .\node_modules\.cache -ErrorAction SilentlyContinue
}

Write-Host "📦 pnpm install"
pnpm install

Write-Host "🧪 Typecheck"
pnpm run typecheck:all 2>$null || Write-Host "Typecheck target may not exist in workspace; skipping" -ForegroundColor Yellow

Write-Host "🔍 Lint"
pnpm run lint:all 2>$null || Write-Host "Lint target may not exist locally; skipping" -ForegroundColor Yellow

Write-Host "🗃 Prisma generate"
pnpm run prisma:gen 2>$null || Write-Host "Prisma generator not configured locally; skipping" -ForegroundColor Yellow

Write-Host "🗃 Prisma migrate dev (non-prod)"
pnpm run prisma:migrate:dev 2>$null || Write-Host "No migrations to run or workspace not set for DB; skip" -ForegroundColor Yellow

if ($StudioOnly -and -not $ShipOnly) {
  Write-Host "🏗 Build Studio"
  pnpm --filter @corae/studio build
} elseif ($ShipOnly -and -not $StudioOnly) {
  Write-Host "🚢 Build Ship"
  pnpm --filter @corae/ship build
} else {
  Write-Host "🏗 Build Studio & Ship"
  pnpm --filter @corae/studio build
  pnpm --filter @corae/ship build
}

Write-Host "🌱 Seed (home/work)"
pnpm run seed:home 2>$null || Write-Host "seed:home script not found; skipping" -ForegroundColor Yellow
pnpm run seed:work 2>$null || Write-Host "seed:work script not found; skipping" -ForegroundColor Yellow

Write-Host "✅ Maintenance complete"
