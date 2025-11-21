# Marketing Appraisals (OMS â†’ Commercial â†’ Marketing)

Generates three assets per prospect:
1) Expanded Appraisal (Markdown)
2) One-Pager (Markdown)
3) WhatsApp Nudge (plain text)

**Constitutional placement**
- Domain: **Commercial / Marketing** (Front Office)
- Path: `/apps/business/oms/commercial/marketing/appraisals/`
- Pre-OBARI (intelligence before `order`)
- Optional Pulse feed: top-of-funnel KPIs (lead quality, conversion)

**Workflow**
- Input: Company, website, sector, location, highlights from a quick site scan
- Output: 
  - one-pager + report (copy/download from UI)
  - optional: copy into CRM/Deal (link to OBARI `order` once created)

**Compliance**
- FileLogicLaw (canonical path; no aliases in laws)
- CommercialLaw (CRM/Marketing live under `/commercial`)
- Data: no secrets; PII follows CRM policy
