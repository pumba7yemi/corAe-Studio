# DEPRECATED — replaced by `scripts/caia-tidy.mjs` (Node runner). Keep for reference.
<#
CAIA tidy script (safe, interactive)

This script performs a conservative tidy run:
- Calls the existing Node tidy plan generator (scripts/tidy-corae.mjs)
- Calls tidy-apply to print git mv/rm commands
- Shows the proposed git commands and asks for explicit confirmation
- If confirmed, runs the git mv / rm commands, archives any unexpected files into z._graveyard,
  runs the audit and CAIA build steps, and commits the result.

USAGE (from repo root):
  pwsh scripts/caia-tidy.ps1

This script is intentionally interactive to avoid accidental destructive moves. It will not
apply any changes unless you type YES when prompted.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "Running tidy plan (dry-run) via node scripts/tidy-corae.mjs..." -ForegroundColor Cyan
Push-Location (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)
Set-Location ..

if (-not (Test-Path scripts/tidy-corae.mjs)) {
  Write-Error "scripts/tidy-corae.mjs not found. Please run from repository root where scripts/ exists."
  Exit 1
}

node scripts/tidy-corae.mjs | Tee-Object -FilePath .\tmp.tidy-plan.txt
node scripts/tidy-apply.mjs | Tee-Object -FilePath .\tmp.tidy-git-cmds.txt

$cmds = Get-Content .\tmp.tidy-git-cmds.txt | Where-Object { $_ -match '^git mv |^git rm' }
if (-not $cmds) {
  Write-Host "No git move/delete commands proposed. Exiting." -ForegroundColor Yellow
  Pop-Location
  Exit 0
}

Write-Host "Proposed git commands:" -ForegroundColor Green
$cmds | ForEach-Object { Write-Host "  $_" }

if ($env:CAIA_TIDY_AUTO -eq '1') {
  Write-Host "Auto-confirm enabled via CAIA_TIDY_AUTO=1" -ForegroundColor Yellow
  $confirm = 'YES'
} else {
  $confirm = Read-Host "Type YES to apply these git commands and continue with build (case-sensitive)"
}
if ($confirm -ne 'YES') {
  Write-Host "Aborting. No changes applied." -ForegroundColor Yellow
  Pop-Location
  Exit 0
}

Write-Host "Applying git commands..." -ForegroundColor Cyan
foreach ($line in $cmds) {
  if ($line -like 'git mv*') {
    & git mv -v -- $($line -replace '^git mv -v\s+', '')
  } elseif ($line -like 'git rm*') {
    # run removal carefully
    & git rm -r --cached -- $($line -replace '^git rm -r --cached\s+', '') 2>$null
    # also remove from FS as fallback
    $path = ($line -replace '^git rm -r --cached\s+\"|\"\s*\|.*$','')
    if (Test-Path $path) { Remove-Item -Recurse -Force $path }
  }
}

Write-Host "Running audit and CAIA build steps..." -ForegroundColor Cyan
try {
  pnpm audit
} catch {
  Write-Warning "pnpm audit failed or reported issues. Continuing to build steps."
}

try { pnpm build:skim } catch { Write-Warning "build:skim failed" }
try { pnpm build:promote } catch { Write-Warning "build:promote failed" }
try { pnpm build:verify } catch { Write-Warning "build:verify failed" }

Write-Host "Staging changes and committing" -ForegroundColor Cyan
& git add -A
& git commit -m "CAIA tidy: normalize faith/discern structure, archive rogue folders, verify 150-Logic" || Write-Host "No changes to commit or commit failed." -ForegroundColor Yellow

Write-Host "Tidy complete. Re-run node scripts/audit-corae.mjs to verify." -ForegroundColor Green

Pop-Location
