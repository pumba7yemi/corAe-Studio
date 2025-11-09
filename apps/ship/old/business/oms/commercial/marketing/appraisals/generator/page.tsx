// 'use client';
/**
 * TODO: paste the full Appraisal Generator component here.
 * Recommended path (kept minimal to avoid merge noise):
 * /apps/ship/business/oms/commercial/marketing/appraisals/generator/page.tsx
 */
export default function AppraisalGenerator() {
  return (
    <div style={{padding:16,fontFamily:'sans-serif'}}>
      <h1>Marketing Appraisal Generator</h1>
      <p>Scaffold ready. Paste the full React/Next.js page code here.</p>
    </div>
  );
}
"

# Seed data file
New-File "apps/ship/business/oms/commercial/marketing/appraisals/data/sectors.json" @"
{
  "property": {
    "risks": [
      "Email-led maintenance triage",
      "Manual renewals tracking",
      "Fragmented spreadsheets",
      "Lagging director visibility"
    ],
    "benchmarks": {
      "hours_reclaimed_pct": [25, 45],
      "ttr_improvement_pct": [30, 50],
      "arrears_improvement_pct": [10, 20],
      "units_per_fte_multiplier": [1.5, 3.0]
    }
  }
}
"

# ----------------------------
# 2) Constitutional Laws (placeholders to paste full TS constants)
# ----------------------------
 = "laws"
New-Dir 

New-File "/filelogic.law.ts" @"
// Placeholder: FileLogic Constitutional Law
// TODO: Paste the full FileLogicLaw TS constant here (no imports, no aliases).
export default {};
"

New-File "/commercial.law.ts" @"
// Placeholder: Commercial Law (Front Office)
// TODO: Paste the full CommercialLaw TS constant here.
export default {};
"

New-File "/service.law.ts" @"
// Placeholder: Service & Delivery Law
// TODO: Paste the full ServiceLaw TS constant here.
export default {};
"

New-File "/middle-office.law.ts" @"
// Placeholder: Middle Office Law
// TODO: Paste the full MiddleOfficeLaw TS constant here.
export default {};
"

New-File "/support.law.ts" @"
// Placeholder: Support Law (Back Office)
// TODO: Paste the full SupportLaw TS constant here.
export default {};
"

New-File "/governance.law.ts" @"
// Placeholder: Governance Law
// TODO: Paste the full GovernanceLaw TS constant here.
export default {};
"

New-File "/obari.law.ts" @"
// Placeholder: OBARI Constitutional Law
// TODO: Paste the reconciled OBARI_Law TS constant here (with normalization map).
export default {};
"

New-File "/pulse.law.ts" @"
// Placeholder: Pulse Law (Executive KPIs & Exceptions)
// TODO: Paste the full PulseLaw TS constant here.
export default {};
"

# ----------------------------
# 3) Sanity markers for git on empty dirs
# ----------------------------
Get-ChildItem -Directory -Recurse apps | Where-Object {
  -not (Get-ChildItem .FullName -File -Recurse -ErrorAction SilentlyContinue)
} | ForEach-Object {
   = Join-Path .FullName ".gitkeep"
  if (-not (Test-Path )) { New-File  "" }
}

Write-Host "
✅ Scaffold complete."
Write-Host "Next:"
Write-Host "1) Paste the full generator UI into: apps/ship/business/oms/commercial/marketing/appraisals/generator/page.tsx"
Write-Host "2) Paste each TS law constant into /laws/*.law.ts"
Write-Host "3) Commit and push."
# corAe scaffold: Marketing Appraisal + Constitutional Laws
# Run from repo root:  .\scaffold-corAe.ps1

function New-Dir {
  param([string])
  if (-not (Test-Path -Path )) {
    New-Item -ItemType Directory -Path  | Out-Null
    Write-Host "Created: "
  }
}

function New-File {
  param(
    [string],
    [string] = ""
  )
  if (-not (Test-Path -Path )) {
     = Split-Path -Parent 
    if ( -and -not (Test-Path -Path )) { New-Dir  }
     | Out-File -FilePath  -Encoding UTF8
    Write-Host "Created: "
  } else {
    Write-Host "Exists:  "
  }
}

# ----------------------------
# 1) App tree (OMS → Commercial → Marketing → Appraisals)
# ----------------------------
apps/ship/business/oms/commercial/marketing/appraisals = "apps/ship/business/oms/commercial/marketing/appraisals"

New-Dir "apps/ship/business/oms/commercial/marketing/appraisals/generator"
New-Dir "apps/ship/business/oms/commercial/marketing/appraisals/templates"
New-Dir "apps/ship/business/oms/commercial/marketing/appraisals/data"

# README for module
# Marketing Appraisals (OMS → Commercial → Marketing)

This module generates three assets per prospect:
1) Expanded Appraisal (Markdown/PDF)
2) One-Pager (Markdown/PDF)
3) WhatsApp Nudge (plain text)

**Placement (Constitutional)**
- Domain: **Commercial / Marketing** (Front Office)
- Path: \/apps/ship/business/oms/commercial/marketing/appraisals/\
- Feeds **Pulse** with top-of-funnel KPIs (optional).
- Pre-OBARI (intelligence prior to \order\).

**Workflow**
- Input: Company name, website, sector, highlights.
- Output files saved alongside or exported to a deal folder on OBARI \order\ creation.

**Compliance**
- Follows \CommercialLaw\ and \FileLogicLaw\.
- No secrets in this module. PII handled via CRM policies. = @"
# Marketing Appraisals (OMS → Commercial → Marketing)

This module generates three assets per prospect:
1) Expanded Appraisal (Markdown/PDF)
2) One-Pager (Markdown/PDF)
3) WhatsApp Nudge (plain text)

**Placement (Constitutional)**
- Domain: **Commercial / Marketing** (Front Office)
- Path: \/apps/ship/business/oms/commercial/marketing/appraisals/\
- Feeds **Pulse** with top-of-funnel KPIs (optional).
- Pre-OBARI (intelligence prior to \order\).

**Workflow**
- Input: Company name, website, sector, highlights.
- Output files saved alongside or exported to a deal folder on OBARI \order\ creation.

**Compliance**
- Follows \CommercialLaw\ and \FileLogicLaw\.
- No secrets in this module. PII handled via CRM policies.
