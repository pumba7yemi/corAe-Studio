import { NextRequest, NextResponse } from "next/server";
import {
  addTimeReclaimed,
  setFlowScore,
  updateAscendProfile,
} from "../../../../../packages/caia-core/context/ascend";

function getUserId(_req: NextRequest): string {
  return "demo-user";
}

type WorkAscendPayload = {
  /** additional minutes reclaimed today through automation or better flow */
  timeReclaimedMinutes?: number;
  /** 0–100 perceived work-day flow score */
  flowScore?: number;
  /** optional stage bump (e.g. HOME → WORK) */
  stage?: "HOME" | "WORK" | "BUSINESS" | "CREATOR";
};

export async function POST(req: NextRequest) {
  const userId = getUserId(req);

  let body: WorkAscendPayload;
  try {
    body = (await req.json()) as WorkAscendPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  let profile;
  if (typeof body.timeReclaimedMinutes === "number") {
    profile = await addTimeReclaimed(userId, body.timeReclaimedMinutes);
  }

  if (typeof body.flowScore === "number") {
    profile = await setFlowScore(userId, body.flowScore);
  }

  if (body.stage) {
    profile = await updateAscendProfile(userId, { stage: body.stage });
  }

  // If nothing changed, just return current profile
  if (!profile) {
    return NextResponse.json(
      { error: "No recognised fields in payload" },
      { status: 400 }
    );
  }

  return NextResponse.json(profile);
}
