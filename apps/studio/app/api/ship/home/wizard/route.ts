// apps/studio/app/api/ship/home/wizard/route.ts
import { NextRequest, NextResponse } from "next/server";

type FlowId =
  | "homefocus" | "finance" | "shopping" | "mealprep" | "cleaning"
  | "wardrobe"  | "mindful" | "glamglow" | "fitness";

type Status = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

interface StepState {
  id: string;                // e.g., "household-basics", "anchor-day", etc.
  data: Record<string, any>; // arbitrary payload per step
  updatedAt: string;
}

interface FlowState {
  flowId: FlowId;
  steps: StepState[];
  status: Status;
  progress: number;          // 0..100
  updatedAt: string;
}

interface WizardState {
  scope: "HOME";
  ownerKey: string;          // user/household identifier
  flows: Record<FlowId, FlowState>;
  createdAt: string;
  updatedAt: string;
}

const mem = {
  states: new Map<string, WizardState>(), // key = `${scope}:${ownerKey}`
};

function keyOf(ownerKey: string) { return `HOME:${ownerKey}` as const; }

function ensure(ownerKey: string): WizardState {
  const k = keyOf(ownerKey);
  let s = mem.states.get(k);
  if (!s) {
    const now = new Date().toISOString();
    const emptyFlow = (flowId: FlowId): FlowState => ({
      flowId, steps: [], status: "NOT_STARTED", progress: 0, updatedAt: now,
    });
    s = {
      scope: "HOME",
      ownerKey,
      flows: {
        homefocus: emptyFlow("homefocus"),
        finance:   emptyFlow("finance"),
        shopping:  emptyFlow("shopping"),
        mealprep:  emptyFlow("mealprep"),
        cleaning:  emptyFlow("cleaning"),
        wardrobe:  emptyFlow("wardrobe"),
        mindful:   emptyFlow("mindful"),
        glamglow:  emptyFlow("glamglow"),
        fitness:   emptyFlow("fitness"),
      },
      createdAt: now,
      updatedAt: now,
    };
    mem.states.set(k, s);
  }
  return s;
}

function setProgress(flow: FlowState) {
  const total = Math.max(1, flow.steps.length);
  const completed = flow.steps.filter(st => st.data?.__completed === true).length;
  const pct = Math.round((completed / total) * 100);
  flow.progress = Math.max(flow.progress, pct);
}

/** GET: ?ownerKey=xyz[&flowId=finance] */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ownerKey = searchParams.get("ownerKey") || "default";
  const flowId = searchParams.get("flowId") as FlowId | null;

  const state = ensure(ownerKey);
  if (flowId) {
    return NextResponse.json({ ok: true, flow: state.flows[flowId] });
  }
  return NextResponse.json({ ok: true, state });
}

/** POST actions */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const ownerKey = (body.ownerKey as string) || "default";
  const action = body.action as
    | "saveStep" | "setStatus" | "loadState" | "listFlows" | "resetFlow";

  const state = ensure(ownerKey);
  const now = new Date().toISOString();

  if (action === "saveStep") {
    const flowId = body.flowId as FlowId;
    const stepId = body.stepId as string;
    const data = (body.data ?? {}) as Record<string, any>;
    if (!flowId || !stepId) {
      return NextResponse.json({ ok: false, error: "flowId and stepId required" }, { status: 400 });
    }
    const flow = state.flows[flowId];
    const idx = flow.steps.findIndex(s => s.id === stepId);
    if (idx >= 0) flow.steps[idx] = { id: stepId, data, updatedAt: now };
    else flow.steps.push({ id: stepId, data, updatedAt: now });
    flow.status = flow.status === "NOT_STARTED" ? "IN_PROGRESS" : flow.status;
    setProgress(flow);
    flow.updatedAt = now;
    state.updatedAt = now;
    return NextResponse.json({ ok: true, flow });
  }

  if (action === "setStatus") {
    const flowId = body.flowId as FlowId;
    const status = (body.status as Status) || "IN_PROGRESS";
    if (!flowId) return NextResponse.json({ ok: false, error: "flowId required" }, { status: 400 });
    const flow = state.flows[flowId];
    flow.status = status;
    if (status === "COMPLETED") flow.progress = 100;
    flow.updatedAt = now;
    state.updatedAt = now;
    return NextResponse.json({ ok: true, flow });
  }

  if (action === "loadState") {
    return NextResponse.json({ ok: true, state });
  }

  if (action === "listFlows") {
    const flows = Object.values(state.flows).map(f => ({
      flowId: f.flowId, status: f.status, progress: f.progress, updatedAt: f.updatedAt,
    }));
    return NextResponse.json({ ok: true, flows });
  }

  if (action === "resetFlow") {
    const flowId = body.flowId as FlowId;
    if (!flowId) return NextResponse.json({ ok: false, error: "flowId required" }, { status: 400 });
    const now2 = new Date().toISOString();
    state.flows[flowId] = { flowId, steps: [], status: "NOT_STARTED", progress: 0, updatedAt: now2 };
    state.updatedAt = now2;
    return NextResponse.json({ ok: true, flow: state.flows[flowId] });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
}