// apps/studio/app/api/ship/work/operations/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  createObariEngine,
  InMemoryStorage,
  InMemoryTaskQueue,
  SimpleEventBus,
  type WizardEngine,
} from "@/lib/wizard/wizard";

let _engine: WizardEngine | null = null;
function engine() {
  if (_engine) return _engine;
  _engine = createObariEngine({
    storage: new InMemoryStorage(),
    tasks: new InMemoryTaskQueue(),
    bus: new SimpleEventBus(),
  });
  return _engine;
}

/**
 * POST actions:
 * - { action:"seedFromBlueprint", blueprint:{...} } → sets up queues/routes
 * - { action:"assign", workItem:{...}, partnerId, slaHours } → creates acceptance task
 * - { action:"acknowledge", workId } → marks accepted, cancels escalation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eng = engine();

    if (body.action === "seedFromBlueprint") {
      const bp = body.blueprint;
      if (!bp) return NextResponse.json({ ok: false, error: "blueprint required" }, { status: 400 });

      await eng.enqueueTask("operations-bin", "PushReport", { tags: bp.tags ?? [], blueprintVersion: bp.version ?? 1 });
      for (const w of bp.workItems ?? []) {
        await eng.enqueueTask("operations-bin", "RegisterWorkItemType", { id: w.id, name: w.name, fields: w.fields });
      }
      return NextResponse.json({ ok: true, seeded: true });
    }

    if (body.action === "assign") {
      const { workItem, partnerId, slaHours = 24 } = body;
      if (!workItem || !partnerId) return NextResponse.json({ ok: false, error: "workItem and partnerId required" }, { status: 400 });
      const due = Date.now() + Number(slaHours) * 3600 * 1000;
      await eng.enqueueTask("operations-bin", "NotifyAssignment", { partnerId, workItem });
      await eng.enqueueTask("operations-bin", "ReminderAcceptance", { partnerId, workItem, dueAt: new Date(due).toISOString() });
      return NextResponse.json({ ok: true });
    }

    if (body.action === "acknowledge") {
      const { workId } = body;
      if (!workId) return NextResponse.json({ ok: false, error: "workId required" }, { status: 400 });
      await eng.enqueueTask("operations-bin", "MarkAccepted", { workId, ts: new Date().toISOString() });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "ship/work/operations" });
}