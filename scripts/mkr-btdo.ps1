# DEPRECATED — replaced by `scripts/mkr-btdo.mjs` (Node runner).
# ───────────────────────────────────────────────
# corAe — MKR (Make Required) for BTDO Module
# Creates all directories for BTDO APIs + pages + data store
# Windows-first / PowerShell-only
# ───────────────────────────────────────────────

Write-Host "🔧 corAe BTDO MKR Starting..."

# Base repo paths
$repoRoot = "C:\corAe\corAe-Studio"
$appPath  = Join-Path $repoRoot "apps\studio"
$dataPath = Join-Path $repoRoot ".data\btdo"

# Ensure data directory
New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
Write-Host "📁 Data dir ready: $dataPath"

# --- API structure ---
$apiPaths = @(
  "$appPath\app\api\btdo",
  "$appPath\app\api\btdo\leads",
  "$appPath\app\api\btdo\leads\[id]",
  "$appPath\app\api\btdo\leads\[id]\events",
  "$appPath\app\api\btdo\leads\[id]\apply-template",
  "$appPath\app\api\btdo\leads\[id]\convert-to-bdo",
  "$appPath\app\api\btdo\requirements",
  "$appPath\app\api\btdo\requirements\templates",
  "$appPath\app\api\btdo\requirements\templates\create",
  "$appPath\app\api\btdo\requirements\templates\list"
)

foreach ($p in $apiPaths) {
  New-Item -ItemType Directory -Force -Path $p | Out-Null
}
Write-Host "✅ API directories created."

# --- Pages structure ---
$pagePaths = @(
  "$appPath\app\btdo",
  "$appPath\app\btdo\leads",
  "$appPath\app\btdo\leads\[id]",
  "$appPath\app\btdo\campaigns"
)

foreach ($p in $pagePaths) {
  New-Item -ItemType Directory -Force -Path $p | Out-Null
}
Write-Host "✅ Pages directories created."

# --- Lib + Prisma ---
$libPath = "$appPath\lib"
$prismaPath = "$appPath\prisma\schemas"

New-Item -ItemType Directory -Force -Path $libPath | Out-Null
New-Item -ItemType Directory -Force -Path $prismaPath | Out-Null
Write-Host "✅ Library + Prisma folders confirmed."

# --- Placeholder files (to avoid empty dirs disappearing in Git) ---
$placeholders = @(
  "$dataPath\.keep",
  "$appPath\app\api\btdo\.keep",
  "$appPath\app\btdo\.keep"
)
foreach ($f in $placeholders) { Set-Content -Path $f -Value "keep" }

Write-Host "🧱 corAe BTDO MKR completed successfully."
