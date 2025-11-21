"use client";

import React, { useMemo, useState } from "react";

/**
 * corAe Marketing Appraisal Generator â€” Mini Module
 * Path: /apps/business/oms/commercial/marketing/appraisals/generator/page.tsx
 *
 * Input: company basics (name, site, sector, location, contact, highlights)
 * Output:
 *  1) Expanded Appraisal (Markdown)
 *  2) One-Pager (Markdown)
 *  3) WhatsApp Nudge (Plain text)
 *
 * No external libraries. Tailwind optional; falls back to basic styling if absent.
 */

type Inputs = {
  companyName: string;
  website: string;
  sector: string;
  location: string;
  contactName: string;
  quickHighlights: string; // bullet list from website scan (optional)
};

type Outputs = {
  slug: string;
  reportMd: string;
  onePagerMd: string;
  whatsappText: string;
};

function toSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function safe(s: string) {
  return s && s.trim().length > 0 ? s.trim() : "(To be confirmed with client)";
}

/** Core content builders */
function buildOutputs(i: Inputs): Outputs {
  const slug = toSlug(i.companyName || "company");

  const COMPANY = safe(i.companyName);
  const WEBSITE = i.website?.trim() || "";
  const SECTOR = safe(i.sector);
  const LOCATION = safe(i.location);
  const CONTACT = i.contactName?.trim() || "there";
  const HIGHLIGHTS =
    i.quickHighlights?.trim() ||
    "- (From website) Core services/products\n- (From website) Positioning or differentiator\n- (From website) Notable clients/partners or growth note";

  const reportMd = `# corAe â†’ ${COMPANY}
## Expanded Appraisal (Full)

### 1) Company Snapshot
- **Name:** ${COMPANY}
- **Location:** ${LOCATION}
- **Sector:** ${SECTOR}
- **Website:** ${WEBSITE || "(To be confirmed)"}
- **Operating reality (from public site):**
${HIGHLIGHTS
  .split("\n")
  .map((l) => (l.startsWith("-") ? l : `- ${l}`))
  .join("\n")}

### 2) Potential & Identifiable Risk Factors (Sector-Common)
- Many firms rely heavily on email/task lists, where follow-ups can get buried.
- Portfolio/ops data spread across spreadsheets and shared drives â†’ version drift.
- Renewals, inspections, maintenance often tracked manually â†’ chance of oversight.
- Directors typically receive reports after the fact, not in real time.

### 3) corAe Opportunity Map (Where We Plug In)
- **3Â³DTDâ„¢ takeover:** convert every inbound (email/WhatsApp/call/form) into a numbered, trackable workflow.
- **Pulseâ„¢ for directors:** live KPIs + exceptions; act in seconds, not weeks.
- **Contained AI agents:** autonomous triage, routing, and document ops; humans handle edge cases.
- **CIMSâ„¢ (comms):** structured channels (Tenants, Vendors, Deals) with full audit trail.
- **OBARIâ„¢ spine:** Order â†’ Booking â†’ Active â†’ Reporting â†’ Invoicing across flows.

### 4) AI-Driven Automation & Executive Insight (Contained AI)
- **Maintenance triage:** parse issue â†’ create WO â†’ assign vendor â†’ schedule â†’ notify â†’ chase â†’ close â†’ auto-invoice.
- **Tenant comms:** FAQs, viewings, reminders, updates; escalate only exceptions to staff.
- **Leases & docs:** auto-generate agreements/renewals/notices; clause logic; e-sign; file; recall.
- **Financial cadence:** rent runs, arrears nudges, reconciliations; exception alerts.
- **Director Pulse:** occupancy, renewals due, rent collection, maintenance backlog, avg TTR, NPS, cash position, variance vs target; drill to detail in 1 click.

### 5) Built on Real Business Experience, Realized by AI
corAe was built on the back of real-world business operations â€” then **realized and supercharged by contained AI**.  
- **Human-first design:** workflows modeled from real operators.
- **AI as engine:** executes proven logic with speed/consistency.
- **Freedom for leaders:** Pulse replaces chase-work; decisions on live truth.

### 6) 30â€“90 Day Deployment Plan
- **Weeks 0â€“2 (Map & Quick Wins):**
  - Intake: current flows, templates, SLAs, roles, compliance rules.
  - Prioritize quick wins: maintenance, renewals, tenant comms.
  - Define KPIs for Pulse; connect data sources.
- **Weeks 3â€“6 (Script & Pilot):**
  - Script 3Â³DTD pipelines; wire CIMS templates.
  - Build lease/doc automations + e-sign; vendor rota + SLA timers.
  - Pilot on a portfolio slice; measure TTR, CSAT, ops hours saved.
- **Weeks 7â€“12 (Scale & Harden):**
  - Extend to full portfolio; add arrears workflows and reporting pack.
  - Finalize Pulse dashboards; permissions; audit; backup/retention.
  - Handover playbooks + training; go-live.

### 7) KPIs & Pulse (Top 8)
- **Occupancy rate**
- **Renewals due (7/30/60 days)**
- **Rent collection % / arrears aging**
- **Maintenance backlog & Avg Time-to-Resolve**
- **SLA compliance % (vendor)**
- **NPS / tenant satisfaction**
- **Cash position & 13-week forecast**
- **Variance vs target (income/expense)**

### 8) 3Â³DTDâ„¢ Takeover (How Inbox â†’ Structured Flow)
- **Intake:** every message/request â†’ DTD entry with unique ID.
- **Classify:** Property / Tenant / Vendor / Finance / Legal.
- **Script:** attach a standard workflow (checklist, owners, timers).
- **Execute:** AI routes tasks, posts updates, generates docs.
- **Close & learn:** auto-close on outcomes; log metrics; improve scripts.

### 9) Security & â€œContained AIâ€ Controls
- **Boundaries:** AI runs inside corAe; no external data egress.
- **Roles & permissions:** Director / Manager / Ops / Vendor / Read-only.
- **Audit & retention:** immutable timeline; doc versions; legal holds.
- **Compliance:** Data residency options; e-sign trails; access reviews.

### 10) ROI Model (Indicative, Sector Benchmarks)
- **Ops hours reclaimed:** 25â€“45% of back-office time in the first 90 days.
- **Maintenance TTR:** 30â€“50% faster â†’ fewer escalations/voids.
- **Arrears & leakage:** 10â€“20% improvement via nudges/visibility.
- **Scale without headcount:** manage 1.5â€“3Ã— units per ops FTE.

### 11) Director Perspective â€“ A Polite Nudge
â€œAs directors, your success reflects the standards you set and the strength of your people. Yet there are only 24 hours in a day. If every task had your personal precision, results would excel even further. corAeâ€™s contained AI ensures routine tasks are executed as if you checked them yourself â€” freeing your team to add value, and giving you the freedom to focus on growth.â€

### 12) Next Steps & CTA
- **Step 1:** 45-min discovery (portfolio slice + priorities).
- **Step 2:** 2-week pilot build (maintenance + renewals + Pulse v1).
- **Step 3:** Scale to full portfolio by day 90.
- **Call to action:** 10-minute intro this week to confirm pilot scope.
`;

  const onePagerMd = `# corAe Ã— ${COMPANY}
**From Potential Inefficiencies to AI-Run Operations (in 30â€“90 Days)**

**What you do (from your website)**
${HIGHLIGHTS
  .split("\n")
  .map((l) => (l.startsWith("-") ? l : `- ${l}`))
  .join("\n")}

**Typical sector challenges (polite, non-presumptive)**
- Tasks scattered across emails/spreadsheets â†’ harder follow-ups.
- Renewals/compliance sometimes tracked manually â†’ risk of delay.
- Directors often see lagging reports, not live KPIs.

**What corAe offers**
- **3Â³DTDâ„¢:** turns every inbound into a numbered, trackable workflow.
- **Contained AI:** auto-triage, assign, schedule, chase, and generate docs.
- **Pulseâ„¢:** live KPIs for directors (occupancy, renewals, cash, maintenance).
- **CIMSâ„¢:** structured comms; full audit trail.
- **OBARIâ„¢:** Order â†’ Booking â†’ Active â†’ Reporting â†’ Invoicing.

**Built on real business experience, realized by AI**
- Human-first workflows; AI executes with speed and consistency.

**Results seen in the sector (benchmarks)**
- 25â€“45% back-office time reclaimed.
- 30â€“50% faster maintenance resolution.
- 10â€“20% arrears/renewal improvement.
- Manage 1.5â€“3Ã— units per ops FTE.

**Deployment (30â€“90 days)**
- **Weeks 0â€“2:** map flows, choose quick wins.
- **Weeks 3â€“6:** script AI workflows, launch Pulse v1 pilot.
- **Weeks 7â€“12:** scale across portfolio, finalize KPIs, train team.

**Next step**
- 10-minute intro to explore fit and scope a 2-week pilot.
`;

  const whatsappText = `Hi ${CONTACT}, Iâ€™m David from corAe.

We help ${SECTOR.toLowerCase()} firms move from email-and-task friction to AI-run, director-led operations in 30â€“90 days.

Why this might matter for ${COMPANY}:
â€¢ Sector-common challenges: tasks scattered across email, manual renewals/maintenance, and delayed reporting.
â€¢ corAe automates the routine (maintenance triage, tenant replies, renewals, documents), so your team focuses on growth.
â€¢ Pulse dashboard gives directors live KPIs (occupancy, renewals, cash, backlog) at a glance.

Built on real business experience, realized with contained AI.
Open to a 10-minute intro this week?

â€” David
(${WEBSITE || "corAe"})`;

  return { slug, reportMd, onePagerMd, whatsappText };
}

function copy(text: string) {
  navigator.clipboard.writeText(text);
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AppraisalGeneratorPage() {
  const [inputs, setInputs] = useState<Inputs>({
    companyName: "",
    website: "",
    sector: "",
    location: "",
    contactName: "",
    quickHighlights: "",
  });

  const outputs = useMemo(() => buildOutputs(inputs), [inputs]);

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#e5e7eb" }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2" />
      </div>
      {children}
    </div>
  );

  const Btn: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement>
  > = (props) => (
    <button
      {...props}
      className={
        "rounded-xl border px-3 py-1 text-sm " +
        (props.className || "")
      }
    />
  );

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          corAe Marketing Appraisal Generator
        </h1>
        <div className="text-sm opacity-70">
          Built on real business experience â€¢ Realized by contained AI
        </div>
      </header>

      {/* Inputs */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium">Company Name</label>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="e.g., VS Property Group"
            value={inputs.companyName}
            onChange={(e) =>
              setInputs((s) => ({ ...s, companyName: e.target.value }))
            }
          />

          <label className="block text-sm font-medium mt-3">Website</label>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="https://â€¦"
            value={inputs.website}
            onChange={(e) =>
              setInputs((s) => ({ ...s, website: e.target.value }))
            }
          />

          <label className="block text-sm font-medium mt-3">Sector</label>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="Property investment, development, lettingsâ€¦"
            value={inputs.sector}
            onChange={(e) =>
              setInputs((s) => ({ ...s, sector: e.target.value }))
            }
          />

          <label className="block text-sm font-medium mt-3">Location</label>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="City, Country"
            value={inputs.location}
            onChange={(e) =>
              setInputs((s) => ({ ...s, location: e.target.value }))
            }
          />

          <label className="block text-sm font-medium mt-3">
            Contact Name (optional)
          </label>
          <input
            className="w-full rounded-xl border p-2"
            placeholder="e.g., Ronak / Sarah"
            value={inputs.contactName}
            onChange={(e) =>
              setInputs((s) => ({ ...s, contactName: e.target.value }))
            }
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Quick Highlights (from website scan)
          </label>
          <textarea
            rows={12}
            className="w-full rounded-xl border p-3 font-mono text-sm"
            placeholder={`- Core service 1\n- Core service 2\n- Positioning or differentiator\n- Any notable partner/growth note`}
            value={inputs.quickHighlights}
            onChange={(e) =>
              setInputs((s) => ({ ...s, quickHighlights: e.target.value }))
            }
          />

          <div className="text-xs opacity-70">
            Tip: paste 3â€“6 bullets from their About/Services pages. The generator
            flows these into the appraisal automatically.
          </div>
        </div>
      </section>

      {/* Outputs */}
      <section className="space-y-6">
        <Section title="WhatsApp Nudge">
          <div className="flex items-center justify-end mb-2 gap-2">
            <Btn onClick={() => copy(outputs.whatsappText)}>Copy</Btn>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-6">
            {outputs.whatsappText}
          </pre>
        </Section>

        <Section title="One-Pager (Markdown)">
          <div className="flex items-center justify-end mb-2 gap-2">
            <Btn onClick={() => copy(outputs.onePagerMd)}>Copy</Btn>
            <Btn
              onClick={() =>
                download(`${outputs.slug}-one-pager.md`, outputs.onePagerMd)
              }
            >
              Download .md
            </Btn>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-6">
            {outputs.onePagerMd}
          </pre>
        </Section>

        <Section title="Expanded Appraisal (Markdown)">
          <div className="flex items-center justify-end mb-2 gap-2">
            <Btn onClick={() => copy(outputs.reportMd)}>Copy</Btn>
            <Btn
              onClick={() =>
                download(`${outputs.slug}-appraisal.md`, outputs.reportMd)
              }
            >
              Download .md
            </Btn>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-6">
            {outputs.reportMd}
          </pre>
        </Section>
      </section>
    </div>
  );
}

