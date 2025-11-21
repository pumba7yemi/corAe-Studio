# Nightly Scheduling (Local)

## Windows (Task Scheduler)
Use 'Start a Program':
Program: `pnpm`
Arguments: `run local:nightly`
Time: 4AM daily

## macOS (launchd)
Create `~/Library/LaunchAgents/corae.local-nightly.plist` that runs:
```
pnpm run local:nightly
```

## Linux (cron)
Edit crontab:
```
0 4 * * * cd /path/to/corAe-Studio && pnpm run local:nightly
```
