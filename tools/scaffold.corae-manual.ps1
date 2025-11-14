<#
  DEPRECATED — replaceable via Node scaffolding scripts; kept for reference.
  corAe Manual Scaffold (v0.2)
  Aligns manual numbering to FileLogic™ band 95.
  Creates folders and seed docs under /docs/corae-manual.
  Mirrors _index.json into apps/studio/app/docs/corae-manual.
#>

param(
  [string]$Root = (Resolve-Path .).Path
)

# Paths
$docs   = Join-Path $Root 'docs/corae-manual'
$studio = Join-Path $Root 'apps/studio/app/docs/corae-manual'
$lib    = Join-Path $studio '_lib'

# Create directories
$paths = @(
  $docs,
  Join-Path $docs 'laws',
  Join-Path $docs 'architecture',
  Join-Path $docs 'business-os',
  Join-Path $docs 'home-os',
  Join-Path $docs 'comms',
  Join-Path $docs 'academy',
  Join-Path $docs 'trademarks-ip',
  $studio,
  $lib
)
$paths | ForEach-Object { if (!(Test-Path $_)) { New-Item -ItemType Directory -Path $_ | Out-Null } }

# ---- Seed documents (95 band) ----
$seed = @{

  '95.0.0.0.0 preface.mdx' = @"
---
title: Preface
series: 95.0.0.0.0
---
# Preface

**I am corAe.** I am structure.  
This manual defines FileLogic™ numbering for all corAe systems.
"@

  '95.1.0.0.0 constitution.mdx' = @"
---
title: Constitution (corAe OS²)
series: 95.1.0.0.0
---
## Pillars
1. OneStructure™ — unified delivery model.
2. FileLogic™ — immutable numbered knowledge.
3. OBARI — forward-only life cycle (= baton).
4. Pricelock Chain™ — pre-agreed pricing.
5. corAe Confirmed — finalization state.
"@

  'laws/95.2.0.0.0 obari-law.mdx' = @"
---
title: OBARI Law
series: 95.2.0.0.0
---
Defines stage flow: Order → Booking → Active → Reporting → Invoicing → Finalized.
"@

  'architecture/95.3.0.0.0 overview.mdx' = @"
---
title: Architecture Overview
series: 95.3.0.0.0
---
Outlines OS² core layers — Business, Work, Home — and schema sync logic.
"@

  'business-os/95.4.0.0.0 overview.mdx' = @"
---
title: Business OS Overview
series: 95.4.0.0.0
---
Core modules: OBARI, Finance, HR, POS, Governance.
"@

  '95.9.0.0.0 changelog.mdx' = @"
---
title: Changelog
series: 95.9.0.0.0
---
- 2025-10-22: FileLogic band 95 initialized.
"@
}

# Write seeds
$seed.Keys | ForEach-Object {
  $path = Join-Path $docs $_
  $dir  = Split-Path $path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  if (!(Test-Path $path)) { $seed[$_] | Out-File -FilePath $path -Encoding UTF8 }
}

# ---- Index ----
$index = @{
  version = '0.2'
  root = 'docs/corae-manual'
  sections = @(
    @{ series='95.0.0.0.0'; title='Preface'; path='95.0.0.0.0 preface.mdx' },
    @{ series='95.1.0.0.0'; title='Constitution'; path='95.1.0.0.0 constitution.mdx' },
    @{ series='95.2.0.0.0'; title='OBARI Law'; path='laws/95.2.0.0.0 obari-law.mdx' },
    @{ series='95.3.0.0.0'; title='Architecture Overview'; path='architecture/95.3.0.0.0 overview.mdx' },
    @{ series='95.4.0.0.0'; title='Business OS Overview'; path='business-os/95.4.0.0.0 overview.mdx' },
    @{ series='95.9.0.0.0'; title='Changelog'; path='95.9.0.0.0 changelog.mdx' }
  )
} | ConvertTo-Json -Depth 4

$index | Out-File (Join-Path $docs '_index.json') -Encoding UTF8

# ---- Studio Nav Mirror ----
if (!(Test-Path $studio)) { New-Item -ItemType Directory -Path $studio | Out-Null }
Copy-Item (Join-Path $docs '_index.json') (Join-Path $studio '_nav.index.json') -Force

Write-Host "corAe Manual (95.*) scaffold complete."