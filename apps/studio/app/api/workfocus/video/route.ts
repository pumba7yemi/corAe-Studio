import { NextResponse } from "next/server";

/** Minimal in-memory bundle — in real app, pull from your registry/store */
const MemoryBundles: Record<string, any> = {};

function buildVideoScriptFromNode(node: any) {
  const prereqs = node.requires || [];
  const meta = node.meta || {};
  const steps: string[] = Array.isArray(meta.monkeySteps) ? meta.monkeySteps : [];
  const deadline = meta.deadline ? [String(meta.deadline)] : [];
  const outcome = meta.outcome || node.title;
  const nextStep = meta.nextStep || (node.onYes?.goto ? `Proceed to ${node.onYes?.goto}` : undefined);
  const nextTask = meta.nextTask || undefined;

  const hook = `Today we’ll master: ${node.title}.`;
  const context = `This workflow uses the corAe Work Focus Core Principle — Have you…? If No, do it or learn it. If Yes, move to the next Work Focus.`;
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

export async function POST(req: Request) {
  try {
    const { bundleId, nodeId, bundle } = await req.json();

    // allow sending the bundle inline from the wizard:
    if (bundle && bundle.id) MemoryBundles[bundle.id] = bundle;

    const b = MemoryBundles[bundleId] || bundle;
    if (!b) throw new Error(`Bundle not found: ${bundleId}`);
    const node = (b.nodes || []).find((n: any) => n.id === nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    const script = buildVideoScriptFromNode(node);
    return NextResponse.json({ ok: true, script, queued: false });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
