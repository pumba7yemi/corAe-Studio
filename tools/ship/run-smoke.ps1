"# DEPRECATED — replaced by Node runner tools/ship/run-smoke.mjs (use `pnpm ship:smoke`)
" | Out-Null
param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$AdminSecret = "change-me"
)

$ErrorActionPreference = "Stop"
$logDir = "C:\corAe\corAe-Studio\.logs"
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$log = Join-Path $logDir "smoke-$stamp.log"

$env:SHIP_UPDATE_ADMIN_SECRET = $AdminSecret

"=== SMOKE START $stamp ===" | Tee-Object -FilePath $log
# Run the JS smoke (capture ALL output)
node "C:\corAe\corAe-Studio\tools\ship\smoke-test.js" $BaseUrl 2>&1 | Tee-Object -FilePath $log
$code = $LASTEXITCODE

# Append an explicit summary the Morning Exec parser can find
$summary = @{
  ok       = ($code -eq 0)
  applied  = $true   # your script hits update/apply when secret is set
  ts       = (Get-Date -Format o)
  baseUrl  = $BaseUrl
} | ConvertTo-Json -Compress
"SMOKE_SUMMARY: $summary" | Tee-Object -FilePath $log -Append
"=== SMOKE END $(Get-Date -Format o) ===" | Tee-Object -FilePath $log -Append

# Keep last 14 logs
Get-ChildItem $logDir -Filter "smoke-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 14 | Remove-Item -Force
exit $code