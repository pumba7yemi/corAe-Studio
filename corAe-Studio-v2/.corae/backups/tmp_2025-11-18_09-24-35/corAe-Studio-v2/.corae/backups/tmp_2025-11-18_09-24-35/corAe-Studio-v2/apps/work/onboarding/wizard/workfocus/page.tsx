"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Work Focus Wizard (Live)
 * - Generates base + follow-up nodes with originalTitle kept
 * - Saves to /data/workfocus/<companyId>.json
 * - Redirects to /workfocus/dashboard after save (150% flow)
 * - Run Now (Yes/No) triggers engine immediately
 */

/* -------------------- Types -------------------- */
type WizardInput = {
  title: string;
  prerequisites: string[];
  when: string;
  department: string;
  outcome: string;
  deadline: string;
  monkeySteps: string[];
  nextStep: string;
  nextTask: string;
};

type Action =
  | { type: "learn"; ref: string }
  | { type: "task"; ref: string; payload?: Record<string, any> }
  | { type: "notify"; ref: string; payload?: Record<string, any> }
  | { type: "run"; ref: string; payload?: Record<string, any> }
  | { type: "webhook"; ref: string; payload?: Record<string, any> };

type Node = {
  id: string;
  title: string;
  prompt: string;  // “Have you …?”
  role: string;
  requires?: string[];
  meta?: Record<string, any>;
  onNo?: { actions?: Action[]; goto?: string };
  onYes?: { actions?: Action[]; goto?: string };
};

/* -------------------- Helpers -------------------- */
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "").slice(0, 64);

function toNode(input: WizardInput): Node {
  const id = slug(input.title || "untitled");
  const prompt = `Have you ${input.title.replace(/^send\s+/i, "sent ").replace(/^place\s+/i, "placed ")}?`;
  const nextId = `${id}.followup`;

  const actions: Action[] = [
    { type: "task", ref: "create:task", payload: { title: input.title, owner: input.department } },
    { type: "notify", ref: "cims:auto", payload: { template: "nudge", title: input.title } },
  ];
  if (input.monkeySteps.length) actions.unshift({ type: "learn", ref: `kb:${id}:howto` });

  return {
    id,
    title: input.title,
    prompt,
    role: input.department || "Owner",
    requires: input.prerequisites.map((p) => slug(p)).filter(Boolean),
    meta: {
      originalTitle: input.title, // remember the original title
      when: input.when,
      outcome: input.outcome,
      deadline: input.deadline,
      monkeySteps: input.monkeySteps,
      nextStep: input.nextStep,
      nextTask: input.nextTask,
    },
    onNo: { actions, goto: nextId },
    onYes: { goto: nextId },
  };
}

function followUp(baseId: string, input: WizardInput): Node {
  const fid = `${baseId}.followup`;
  const actions: Action[] = input.nextTask
    ? [{ type: "task", ref: "create:task", payload: { title: input.nextTask } }]
    : [];
  return {
    id: fid,
    title: `Follow-up: ${input.title}`,
    prompt: input.nextStep
      ? `${input.nextStep} — have you done this?`
      : `Have you recorded the outcome for: ${input.title}?`,
    role: input.department || "Owner",
    onNo: { actions },
    onYes: { goto: slug(input.nextTask || "") || undefined },
    meta: { nextTask: input.nextTask || null },
  };
}

function buildVideoScriptFromNode(node: any) {
  const prereqs = node.requires || [];
  const meta = node.meta || {};
  const steps: string[] = Array.isArray(meta.monkeySteps) ? meta.monkeySteps : [];
  const deadline = meta.deadline ? [String(meta.deadline)] : [];
  const outcome = meta.outcome || node.title;
  const nextStep = meta.nextStep || (node.onYes?.goto ? `Proceed to ${node.onYes?.goto}` : undefined);
  const nextTask = meta.nextTask || undefined;

  const hook = `Today we’ll master: ${node.title}.`;
  const context =
    `This workflow uses the corAe Work Focus Core Principle — Have you…? ` +
    `If No, do it or learn it. If Yes, move to the next Work Focus.`;
  const cta = `Mark this Work Focus as complete in corAe, then continue to your next focus.`;

  const parts = [
    hook, "\nContext:", context,
    prereqs.length ? "\nPrerequisites:" : "", prereqs.map((p: string) => `- ${p}`).join("\n"),
    steps.length ? "\nSteps:" : "", steps.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n"),
    deadline.length ? "\nDeadlines:" : "", deadline.map((d: string) => `- ${d}`).join("\n"),
    "\nOutcome:", `- ${outcome}`,
    nextStep ? "\nNext Step:" : "", nextStep ? `- ${nextStep}` : "",
    nextTask ? "\nNext Task:" : "", nextTask ? `- ${nextTask}` : "",
    "\nCall to Action:", cta,
  ].filter(Boolean).join("\n");

  return {
    title: node.title,
    durationHintSec: Math.max(45, steps.length * 10 + 30),
    outline: { hook, context, prerequisites: prereqs, steps, deadlines: deadline, outcome, nextStep, nextTask, cta },
    rawText: parts,
  };
}

/* -------------------- Page -------------------- */
export default function WizardInputFormPage() {
  const router = useRouter();

  const [companyId, setCompanyId] = useState("company.live"); // change per customer
  const [form, setForm] = useState<WizardInput>({
    title: "Send PepsiCo Saturday Vendor Message",
    prerequisites: ["PO number"],
    when: "Week 1 & 3 Thursday (Day-2 policy)",
    department: "Cashier",
    outcome: "Vendor confirms availability and price",
    deadline: "Before 2 PM Thursday",
    monkeySteps: [
      "Open WhatsApp",
      "Find PepsiCo Vendor Contact",
      "Paste vendor message template",
      "Attach PO number",
      "Send",
      "Screenshot confirmation",
    ],
    nextStep: "Check for vendor reply by 4 PM; escalate if no response",
    nextTask: "Finance Manager prepares Saturday cash drop",
  });

  const baseNode = useMemo(() => toNode(form), [form]);
  const followNode = useMemo(() => followUp(baseNode.id, form), [form, baseNode.id]);
  const bundle = useMemo(
    () => ({ id: companyId, title: `Work Focus — ${companyId}`, nodes: [baseNode, followNode] }),
    [companyId, baseNode, followNode]
  );

  async function saveBundle() {
    // 150%: minimal validation + redirect on success
    if (!companyId.trim()) return alert("Company/Bundle ID is required.");
    if (!form.title.trim()) return alert("Title is required.");
    const r = await fetch("/api/workfocus/bundles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(bundle),
    });
    const d = await r.json();
    if (!d.ok) return alert(d.error);
    alert(`Saved: ${d.id} (${d.count} nodes)`);
    router.push("/workfocus/dashboard"); // go straight to chronological view
  }

  async function runNow(answer: "yes" | "no") {
    const r = await fetch("/api/workfocus/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bundleId: companyId, nodeId: baseNode.id, answer }),
    });
    const d = await r.json();
    alert(d.ok ? d.log.join("\n") : d.error);
  }

  function set<K extends keyof WizardInput>(key: K, value: WizardInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // 150%: Ctrl/Cmd+Enter saves quickly
  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") saveBundle();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6" onKeyDown={onKeyDown}>
      {/* LEFT: form */}
      <div>
        <h1 className="text-2xl font-semibold">Work Focus Wizard (Live)</h1>
        <p className="text-sm opacity-70 mb-4">Enter real workflows. Save → auto-redirect to Dashboard. Run anytime.</p>

        <div className="space-y-3">
          <Field label="Company ID / Bundle ID">
            <input className="input" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
          </Field>

          <Field label="1) Title">
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <Field label="2) Prerequisites (comma-separated)">
            <input
              className="input"
              value={form.prerequisites.join(", ")}
              onChange={(e) => set("prerequisites", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>

          <Field label="3) When (timing/frequency)">
            <input className="input" value={form.when} onChange={(e) => set("when", e.target.value)} />
          </Field>

          <Field label="4) Department / Role">
            <input className="input" value={form.department} onChange={(e) => set("department", e.target.value)} />
          </Field>

          <Field label="5) Outcome (what does this achieve?)">
            <input className="input" value={form.outcome} onChange={(e) => set("outcome", e.target.value)} />
          </Field>

          <Field label="6) Deadline">
            <input className="input" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </Field>

          <Field label="7) Monkey Steps (one per line)">
            <Textarea
              value={form.monkeySteps.join("\n")}
              onChange={(v) => set("monkeySteps", v.split("\n").map((s) => s.trim()).filter(Boolean))}
            />
          </Field>

          <Field label="8) Next Step (follow-up within process)">
            <input className="input" value={form.nextStep} onChange={(e) => set("nextStep", e.target.value)} />
          </Field>

          <Field label="9) Next Task (process chain)">
            <input className="input" value={form.nextTask} onChange={(e) => set("nextTask", e.target.value)} />
          </Field>

          <div className="flex flex-wrap gap-2 pt-2">
            <button className="px-3 py-2 rounded-xl border" onClick={saveBundle}>
              Save to WorkFocus (⌘/Ctrl+Enter)
            </button>
            <button className="px-3 py-2 rounded-xl border" onClick={() => runNow("no")}>
              Run Now (No)
            </button>
            <button className="px-3 py-2 rounded-xl border" onClick={() => runNow("yes")}>
              Run Now (Yes)
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: preview + video script */}
      <div>
        <h2 className="text-xl font-medium">Preview (what gets saved)</h2>
        <pre className="bg-black text-white p-4 rounded-xl text-xs overflow-auto">
{JSON.stringify(bundle, null, 2)}
        </pre>

        <h2 className="text-lg font-medium mt-6">Video Script</h2>
        <pre className="bg-black text-white p-4 rounded-xl text-xs overflow-auto">
{buildVideoScriptFromNode(baseNode as any).rawText}
        </pre>
      </div>

      <style>{`
        .input { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; }
      `}</style>
    </div>
  );
}

/* -------------------- Tiny UI bits -------------------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <div className="text-sm font-medium">{label}</div>
      {children}
    </label>
  );
}

function Textarea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <textarea
      className="w-full min-h-40 p-3 rounded-xl border border-gray-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
