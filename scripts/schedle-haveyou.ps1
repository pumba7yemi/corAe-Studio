# DEPRECATED — replaced by `scripts/schedule-haveyou.mjs` (Node helper). Keep for reference.
# scripts/schedule-haveyou.ps1
<#
Registers a Windows Scheduled Task that pings the Have-You tick endpoint every minute.
Usage (PowerShell, Run as Admin):
  ./scripts/schedule-haveyou.ps1 -BaseUrl "http://localhost:3000"
For production, pass your deployed base URL.
#>

param(
  [string]$TaskName = "corAe-HaveYou-Tick",
  [string]$BaseUrl = "http://localhost:3000"
)

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -Command `"try { Invoke-WebRequest -UseBasicParsing -Uri '$BaseUrl/api/ship/haveyou/tick?all=1' | Out-Null } catch { }`""
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1) -RepetitionDuration ([TimeSpan]::MaxValue)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -MultipleInstances IgnoreNew -StartWhenAvailable

try {
  if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false | Out-Null
  }
} catch {}

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Calls corAe Have-You tick every minute (HOME/WORK/BUSINESS)" | Out-Null
Write-Host "✓ Scheduled task '$TaskName' created. It will call: $BaseUrl/api/ship/haveyou/tick?all=1 every minute."