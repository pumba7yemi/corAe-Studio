/**

Company Skeleton — Departments & Essentials Preset (v0.3)

Purpose: When the Wizard starts, preload placeholders for ALL core departments and

their essential processes. These appear as scaffolded Work Focus nodes that

owners can accept, edit, or delete — but the business is never starting from zero.

Drop this file at: /lib/workfocus/presets/companySkeleton.ts

Then register it in your registry and expose it to the Wizard as a selectable template. */


import type { WorkFocusBundle, WorkFocusNode } from "../../workfocus/types";

/**

Department taxonomy (aligned with corAe memory):

Core (Management, Legal, HR) — Finance, Operations, Waste, Facilities — Sales & Marketing — IT/CIMS — Compliance —

Procurement/Vendors — POS/Inventory (Retail) — Data Privacy/Security — Risk — Customer Success. */


export const CompanySkeletonBundle: WorkFocusBundle = { id: "company.skeleton", title: "Company Skeleton — Departments & Essentials", nodes: [ // ────────────────────────────────────────────────────────────────────── // CORE — MANAGEMENT // ────────────────────────────────────────────────────────────────────── { id: "core.mgmt.kickoff", title: "Management Kickoff & Governance", prompt: "Have you defined decision rights and meeting cadence (weekly board, daily stand‑up)?", role: "Owner", onNo: { actions: [ { type: "learn", ref: "kb:governance-cadence" }, { type: "task", ref: "create:meeting.series", payload: { type: "board", cadence: "weekly" } }, { type: "notify", ref: "cims:owner", payload: { template: "setup_governance" } }, ], }, onYes: { goto: "core.legal.entity" }, },

// ──────────────────────────────────────────────────────────────────────
// CORE — LEGAL
// ──────────────────────────────────────────────────────────────────────
{
  id: "core.legal.entity",
  title: "Company Registration",
  prompt: "Have you registered the legal entity (trade license) and obtained necessary permits?",
  role: "Owner",
  onNo: {
    actions: [
      { type: "learn", ref: "kb:uae-company-reg" },
      { type: "task", ref: "create:legal.ticket", payload: { country: "UAE" } },
      { type: "notify", ref: "cims:owner", payload: { template: "company_reg_nudge" } },
    ],
  },
  onYes: { goto: "core.legal.ip" },
},
{
  id: "core.legal.ip",
  title: "IP & Trademarks (corAe bundle)",
  prompt: "Have you filed IP and trademarks (e.g., Work Focus Core Principle™, Pricelock Chain™)?",
  role: "Owner",
  onNo: {
    actions: [
      { type: "task", ref: "create:legal.ip.filing" },
      { type: "learn", ref: "kb:ip-basics" },
    ],
  },
  onYes: { goto: "core.hr.foundations" },
},

// ──────────────────────────────────────────────────────────────────────
// CORE — HR
// ──────────────────────────────────────────────────────────────────────
{
  id: "core.hr.foundations",
  title: "HR Foundations",
  prompt: "Have you created role matrix, Work Focus dashboards, and contracts?",
  role: "HR",
  onNo: {
    actions: [
      { type: "learn", ref: "kb:hr-role-matrix" },
      { type: "task", ref: "create:hr.matrix" },
      { type: "task", ref: "create:hr.contract.templates" },
    ],
  },
  onYes: { goto: "finance.chart.accounts" },
},

// ──────────────────────────────────────────────────────────────────────
// FINANCE
// ──────────────────────────────────────────────────────────────────────
{
  id: "finance.chart.accounts",
  title: "Chart of Accounts & OBARI Link",
  prompt: "Have you set up chart of accounts and OBARI (Order→Booking→Active→Reporting→Invoicing) flows?",
  role: "Finance Manager",
  onNo: {
    actions: [
      { type: "learn", ref: "kb:obari-overview" },
      { type: "task", ref: "finance:chart.setup" },
      { type: "task", ref: "finance:link.pos" },
    ],
  },
  onYes: { goto: "finance.cash.policy" },
},
{
  id: "finance.cash.policy",
  title: "Cash & Payment Policy",
  prompt: "Have you set cash drop rules, vendor payment timing, and bank reconciliation?",
  role: "Finance Manager",
  onNo: {
    actions: [
      { type: "task", ref: "finance:policy.cash" },
      { type: "notify", ref: "cims:financeMgr", payload: { template: "cash_policy_setup" } },
    ],
  },
  onYes: { goto: "ops.procurement.registry" },
},

// ──────────────────────────────────────────────────────────────────────
// OPERATIONS / PROCUREMENT
// ──────────────────────────────────────────────────────────────────────
{
  id: "ops.procurement.registry",
  title: "Vendor Registry & Pricelock Chain™",
  prompt: "Have you created vendor registry with price‑lock & Day‑2 vendor message policy?",
  role: "Operations Manager",
  onNo: {
    actions: [
      { type: "task", ref: "ops:vendor.registry.create" },
      { type: "learn", ref: "kb:pricelock-chain" },
      { type: "notify", ref: "cims:opsMgr", payload: { template: "vendor_registry_setup" } },
    ],
  },
  onYes: { goto: "ops.schedule.28day" },
},
{
  id: "ops.schedule.28day",
  title: "28‑Day Vendor Schedule",
  prompt: "Have you enabled the 28‑day schedule and mapped vendor cadences?",
  role: "Operations Manager",
  onNo: {
    actions: [
      { type: "run", ref: "enable:vendor.schedule28" },
      { type: "task", ref: "ops:vendor.cadence.map" },
    ],
  },
  onYes: { goto: "ops.grv.protocols" },
},
{
  id: "ops.grv.protocols",
  title: "GRV Protocols (UAE Retail)",
  prompt: "Have you embedded GRV/returns SOP and staff training?",
  role: "Operations Manager",
  onNo: {
    actions: [
      { type: "learn", ref: "kb:grv-protocols" },
      { type: "task", ref: "ops:grv.training" },
    ],
  },
  onYes: { goto: "sales.marketing.brief" },
},

// ──────────────────────────────────────────────────────────────────────
// SALES & MARKETING
// ──────────────────────────────────────────────────────────────────────
{
  id: "sales.marketing.brief",
  title: "Marketing Brief & Unwind Listing",
  prompt: "Have you created the marketing brief and activated Unwind listing?",
  role: "Marketing",
  onNo: {
    actions: [
      { type: "task", ref: "create:marketing.brief" },
      { type: "notify", ref: "cims:marketing", payload: { template: "activate_unwind" } },
    ],
  },
  onYes: { goto: "it.cims.setup" },
},

// ──────────────────────────────────────────────────────────────────────
// IT / CIMS
// ──────────────────────────────────────────────────────────────────────
{
  id: "it.cims.setup",
  title: "CIMS™ + Email Domain",
  prompt: "Have you configured the email domain and CIMS routing (WhatsApp sync + fallback)?",
  role: "IT",
  onNo: {
    actions: [
      { type: "task", ref: "it:domain.setup" },
      { type: "task", ref: "it:cims.routing" },
      { type: "learn", ref: "kb:cims-setup" },
    ],
  },
  onYes: { goto: "compliance.ghp.load" },
},

// ──────────────────────────────────────────────────────────────────────
// COMPLIANCE (UAE retail example)
// ──────────────────────────────────────────────────────────────────────
{
  id: "compliance.ghp.load",
  title: "Load GHP SOPs",
  prompt: "Have you loaded municipality GHP SOPs (Handwashing, Hygiene, Storage, Equipment, Laundry, Pest Control)?",
  role: "Compliance",
  onNo: {
    actions: [
      { type: "task", ref: "compliance:ghp.import" },
      { type: "learn", ref: "kb:ghp-overview" },
    ],
  },
  onYes: { goto: "compliance.training.assign" },
},
{
  id: "compliance.training.assign",
  title: "Assign Compliance Training",
  prompt: "Have you assigned compliance training to all roles and scheduled refreshers?",
  role: "Compliance",
  onNo: {
    actions: [
      { type: "task", ref: "compliance:assign.training" },
      { type: "notify", ref: "cims:hr", payload: { template: "assign_training" } },
    ],
  },
  onYes: { goto: "facilities.maintenance.plan" },
},

// ──────────────────────────────────────────────────────────────────────
// FACILITIES / WASTE
// ──────────────────────────────────────────────────────────────────────
{
  id: "facilities.maintenance.plan",
  title: "Facilities Maintenance Plan",
  prompt: "Have you created preventive maintenance plan and vendor contacts?",
  role: "Facilities",
  onNo: {
    actions: [
      { type: "task", ref: "facilities:pm.plan" },
      { type: "task", ref: "facilities:vendor.contacts" },
    ],
  },
  onYes: { goto: "waste.contracts" },
},
{
  id: "waste.contracts",
  title: "Waste Contracts & Weighbridge (if applicable)",
  prompt: "Have you onboarded waste vendor, WTN flow, and (if needed) weighbridge integration?",
  role: "Operations Manager",
  onNo: {
    actions: [
      { type: "task", ref: "waste:contract.setup" },
      { type: "learn", ref: "kb:wtn-basics" },
    ],
  },
  onYes: { goto: "security.privacy.policy" },
},

// ──────────────────────────────────────────────────────────────────────
// SECURITY / PRIVACY / RISK
// ──────────────────────────────────────────────────────────────────────
{
  id: "security.privacy.policy",
  title: "Data Privacy & Security",
  prompt: "Have you set privacy policy, access controls, and backups?",
  role: "IT",
  onNo: {
    actions: [
      { type: "task", ref: "security:access.controls" },
      { type: "task", ref: "security:backup.plan" },
    ],
  },
  onYes: { goto: "risk.register" },
},
{
  id: "risk.register",
  title: "Risk Register",
  prompt: "Have you created a risk register and review cadence?",
  role: "Management",
  onNo: {
    actions: [
      { type: "task", ref: "risk:register.create" },
      { type: "task", ref: "risk:review.schedule" },
    ],
  },
  onYes: { goto: "customer.success.loop" },
},

// ──────────────────────────────────────────────────────────────────────
// CUSTOMER SUCCESS
// ──────────────────────────────────────────────────────────────────────
{
  id: "customer.success.loop",
  title: "Customer Success Loop",
  prompt: "Have you set up feedback → resolution → reward (Marketplace/Credits) loop?",
  role: "Operations Manager",
  onNo: {
    actions: [
      { type: "task", ref: "csat:feedback.channel" },
      { type: "task", ref: "csat:resolution.sla" },
      { type: "task", ref: "csat:rewards.enable" },
    ],
  },
  onYes: {},
},

], };

// Registration helper (optional) export function registerCompanySkeleton(register: (b: WorkFocusBundle) => void) { register(CompanySkeletonBundle); }

// ────────────────────────────────────────────────────────────────────────────── // NEW: /lib/workfocus/video.ts — build a narratable video script from a node // ────────────────────────────────────────────────────────────────────────────── export type VideoScript = { title: string; durationHintSec: number; // rough target duration outline: { hook: string; context: string; prerequisites: string[]; steps: string[]; deadlines?: string[]; outcome: string; nextStep?: string; nextTask?: string; cta: string; }; rawText: string; // concatenated };

export function buildVideoScriptFromNode(node: WorkFocusNode): any {
  const prereqs = node.requires ?? [];
  const meta = (node as any).meta || {};
  const steps: string[] = Array.isArray(meta.monkeySteps) ? meta.monkeySteps : [];
  const deadline = meta.deadline ? [String(meta.deadline)] : [];
  const outcome = meta.outcome || node.title;
  const nextStep = meta.nextStep || (node.onYes?.goto ? `Proceed to ${node.onYes?.goto}` : undefined);
  const nextTask = meta.nextTask || undefined;

  const hook = `Today we'll master: ${node.title}.`;
  const context = `This workflow uses the corAe Work Focus Core Principle — Have you…? If No, do it or learn it. If Yes, move to the next Work Focus.`;
  const cta = `Mark this Work Focus as complete in corAe, then continue to your next focus.`;

  const parts = [
    hook,
    " Context:",
    context,
    prereqs.length ? " Prerequisites:" : "",
    prereqs.map((p) => `- ${p}`).join(" "),
    steps.length ? " Steps:" : "",
    steps.map((s, i) => `${i + 1}. ${s}`).join(" "),
    deadline.length ? " Deadlines:" : "",
    deadline.map((d) => `- ${d}`).join(" "),
    " Outcome:",
    `- ${outcome}`,
    nextStep ? " Next Step:" : "",
    nextStep ? `- ${nextStep}` : "",
    nextTask ? " Next Task:" : "",
    nextTask ? `- ${nextTask}` : "",
    " Call to Action:",
    cta,
  ].filter(Boolean).join(" ");

  return {
    title: node.title,
    durationHintSec: Math.max(45, steps.length * 10 + 30),
    outline: { hook, context, prerequisites: prereqs, steps, deadlines: deadline, outcome, nextStep, nextTask, cta },
    rawText: parts,
  };
}

// NEW: /app/api/workfocus/video/route.ts — stub to accept a node and return a script
import { NextResponse as VideoResponse } from "next/server";
// If the workfocus registry isn't present in this build, suppress the TS error and allow a runtime failure fallback.
 // @ts-ignore
import { Bundles as VideoBundles } from "../../workfocus/registry";
import { WorkFocusEngine as _WFE } from "../../workfocus/engine";

export async function POST(req: Request) {
  try {
    const { bundleId, nodeId } = await req.json();
    const bundle = VideoBundles[bundleId];
    if (!bundle) throw new Error(`Bundle not found: ${bundleId}`);
    const node = bundle.nodes.find((n: WorkFocusNode) => n.id === nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);
    const script = buildVideoScriptFromNode(node as any);
    // TODO: enqueue video render job with your generator (e.g., /api/render)
    return VideoResponse.json({ ok: true, script, queued: false });
  } catch (e: any) {
    return VideoResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
