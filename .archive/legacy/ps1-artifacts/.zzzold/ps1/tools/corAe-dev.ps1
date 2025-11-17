# DEPRECATED — replaced by `tools/corAe-dev.mjs` (Node runner). Kept for reference.
# ──────────────────────────────────────────────
# corAe-dev.ps1 — Clean & Run corAe Ship (Windows PowerShell)
# ──────────────────────────────────────────────

Write-Host "──────────────────────────────────────────────"
Write-Host " ⚙️  corAe Development Launcher (Ship + Studio) "
Write-Host "──────────────────────────────────────────────" -ForegroundColor Cyan

# Navigate to repo root (where package.json is)
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

# Clean build artifacts
Write-Host "`n🧹 Cleaning old build caches..." -ForegroundColor Yellow
$folders = @(".next", "apps\ship\.next", "apps\studio\.next")
foreach ($f in $folders) {
    if (Test-Path $f) {
        Remove-Item -Recurse -Force $f -ErrorAction SilentlyContinue
        Write-Host "  ✅ Removed $f"
    }
}
Write-Host "Done.`n"

# Start corAe Ship app
Write-Host "🚀 Starting corAe Ship app..." -ForegroundColor Green
pnpm --filter @corae/ship dev
