# DEPRECATED — replaced by `tools/caia-preflight.mjs` (Node runner). Kept for reference.
Param()
$ErrorActionPreference = 'Stop'
function Run-Cmd($label, $cmd) {
    Write-Host ('>> ' + $label + ': ' + $cmd)
    & cmd /c $cmd
    if($LASTEXITCODE -ne 0) {
        Write-Host ('[FAILED] ' + $label + ' failed (exit ' + $LASTEXITCODE + ')') -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host ('[OK] ' + $label) -ForegroundColor Green
}

$root = Join-Path $PSScriptRoot '..'
$ruleFile = Join-Path $root '.corae\caia.rule.build.json'
if(-not (Test-Path $ruleFile)){
    Write-Host "Rule file not found: $ruleFile" -ForegroundColor Red
    exit 2
}

try{
    $ruleText = Get-Content -Raw -Path $ruleFile -ErrorAction Stop
    $rule = $ruleText | ConvertFrom-Json
} catch {
    Write-Host "Failed to read or parse rule file: $_" -ForegroundColor Red
    exit 3
}

if(-not $rule.actions -or -not $rule.actions.before){
    Write-Host "No 'actions.before' commands in rule file; nothing to run." -ForegroundColor Yellow
    exit 0
}

Write-Host ("Activating CAIA preflight - running " + ($rule.actions.before).Count + " commands...") -ForegroundColor Cyan

foreach($cmd in $rule.actions.before){
    Run-Cmd 'preflight' $cmd
}

Write-Host 'CAIA preflight completed successfully.' -ForegroundColor Green
exit 0
