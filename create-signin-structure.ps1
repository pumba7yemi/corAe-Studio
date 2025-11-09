# corAe Ship — Sign-in & Company Selector Full Scaffold
# ------------------------------------------------------
# Creates all folders + empty files ready for code paste.
# Root: apps/studio/apps/ship/

$ErrorActionPreference = "Stop"

$root = "apps/studio/apps/ship"

# --- Folder map ---
$dirs = @(
  "$root/app/signin",
  "$root/app/api/session/select",
  "$root/app/api/session/me",
  "$root/app/(core)/components",
  "$root/app/business",
  "$root/app/work",
  "$root/app/home",
  "$root/app/demo",
  "$root/lib"
)

foreach ($d in $dirs) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# --- File placeholders ---
$files = @(
  "$root/app/signin/page.tsx",

  "$root/app/api/session/select/route.ts",
  "$root/app/api/session/me/route.ts",

  "$root/app/(core)/components/CompanySwitcher.tsx",

  "$root/app/business/page.tsx",
  "$root/app/work/page.tsx",
  "$root/app/home/page.tsx",

  "$root/app/demo/companies.ts",

  "$root/lib/session.ts",

  "$root/middleware.ts"
)

foreach ($f in $files) {
  if (-not (Test-Path $f)) {
    New-Item -ItemType File -Force -Path $f | Out-Null
  }
}

Write-Host "`n✅ corAe Ship Sign-in structure created successfully."
Write-Host "Root: $root"
Write-Host "Folders:"
$dirs | ForEach-Object { Write-Host "  - $_" }
Write-Host "`nFiles:"
$files | ForEach-Object { Write-Host "  - $_" }
Write-Host "`nNext:"
Write-Host "  1. Paste code into each file as provided."
Write-Host "  2. Run 'pnpm dev' to test sign-in and company selection flow."