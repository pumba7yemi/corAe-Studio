# DEPRECATED — replaced by `tools/ship/start-dev-and-smoke.mjs` (Node runner). Kept for reference.
$ErrorActionPreference = "Stop"
$env:SHIP_UPDATE_ADMIN_SECRET = "change-me"

# start Next dev in a background window
$workdir = "C:\corAe\corAe-Studio\apps\ship"
Start-Process powershell -ArgumentList @(
  "-NoExit","-ExecutionPolicy","Bypass","-Command",
  "cd '$workdir'; pnpm exec next dev -p 3000 -H 127.0.0.1"
) | Out-Null

# wait for port to open (max ~30s)
$ok = $false
for ($i=0; $i -lt 30; $i++) {
  try {
    Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:3000/api/shadow/ingest" `
      -Headers @{ "content-type"="application/json"; "x-admin-secret"=$env:SHIP_UPDATE_ADMIN_SECRET } `
      -Body "{}" -TimeoutSec 2 | Out-Null
    $ok = $true; break
  } catch { Start-Sleep -Seconds 1 }
}
if (-not $ok) { throw "Dev server failed to start on :3000" }

# run smoke with logging
powershell -ExecutionPolicy Bypass -File "C:\corAe\corAe-Studio\tools\ship\run-smoke.ps1"
