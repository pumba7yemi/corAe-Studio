#!/usr/bin/env pwsh
# /scripts/precommit.ps1
# corAe — Git pre-commit guard (Windows-first)
# Runs the constitutional validator and blocks the commit on violations.

$ErrorActionPreference = 'Stop'

Write-Host "[corAe] Running constitutional validator (FileLogic + OBARI)..." -ForegroundColor Cyan

# Resolve repo root (this file lives in /scripts/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Split-Path -Parent $scriptDir

Push-Location $repoRoot
try {
  # Ensure PowerShell can execute in this process
  try { Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force } catch {}

  $npx = if ($IsWindows) { "npx.cmd" } else { "npx" }
  $args = @("tsx", "scripts/law.validate.ts")

  $proc = Start-Process -FilePath $npx -ArgumentList $args -NoNewWindow -Wait -PassThru -WorkingDirectory $repoRoot

  if ($proc.ExitCode -ne 0) {
    Write-Host "`n[corAe] ❌ Commit blocked by constitutional law violations." -ForegroundColor Red
    Write-Host "Fix the paths/snapshots reported above, then commit again." -ForegroundColor Yellow
    exit 1
  } else {
    Write-Host "[corAe] ✅ Laws OK — proceeding with commit." -ForegroundColor Green
    exit 0
  }
}
finally {
  Pop-Location
}