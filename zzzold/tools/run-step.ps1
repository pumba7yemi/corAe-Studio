param(
  [Parameter(Mandatory=$true)][string] $stepId,
  [Parameter(Mandatory=$true)][string[]] $expected,
  [Parameter(Mandatory=$true)][string] $actionScript
)

$root = Resolve-Path -Relative "."
$locksDir = Join-Path $root ".build_steps"
$caiaMemory = Join-Path $root "corae/services/caia/memory/memory.jsonl"
if (!(Test-Path $locksDir)) { New-Item -ItemType Directory -Path $locksDir | Out-Null }

# Execute the action body
Invoke-Command -ScriptBlock ([ScriptBlock]::Create($actionScript))

# Verify expected outputs
$missing = @()
foreach ($p in $expected) { if (-not (Test-Path $p)) { $missing += $p } }
if ($missing.Count -gt 0) {
  Write-Error "STEP FAILED: missing paths:`n$($missing -join "`n")"
  exit 1
}

# Write lock
$lockFile = Join-Path $locksDir ("{0}.lock" -f $stepId)
$meta = @{
  step    = $stepId
  created = (Get-Date).ToString("o")
  user    = $env:USERNAME
  machine = $env:COMPUTERNAME
  expected= $expected
}
$metaJson = $meta | ConvertTo-Json -Depth 8
Set-Content -Path $lockFile -Value $metaJson -Encoding UTF8

# Append CAIA memory if present
if (Test-Path $caiaMemory) {
  $entry = @{
    id  = (Get-Date).ToString("o") + "_" + ([guid]::NewGuid().ToString()).Substring(0,6)
    ts  = (Get-Date).ToString("o")
    who = "owner"
    type= "step-lock"
    text= "STEP COMPLETED: $stepId"
    meta= $meta
  } | ConvertTo-Json -Compress
  Add-Content -Path $caiaMemory -Value $entry
}

Write-Host "STEP OK: $stepId → $lockFile" -ForegroundColor Green
