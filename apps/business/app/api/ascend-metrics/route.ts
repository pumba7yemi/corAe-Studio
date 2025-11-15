import { NextRequest, NextResponse } from "next/server";
import {
  updateAscendProfile,
  setFlowScore,
} from "../../../../../packages/caia-core/context/ascend";

function getUserId(_req: NextRequest): string {
  return "demo-user";
}

type BusinessAscendPayload = {
  /** 0–100 indicator of how stable the business feels (cash, staff, ops) */
  businessStabilityScore?: number;
  /** 0–100 composite leadership score (manual or computed elsewhere) */
  leadershipScore?: number;
};

export async function POST(req: NextRequest) {
  const userId = getUserId(req);

  let body: BusinessAscendPayload;
  try {
    body = (await req.json()) as BusinessAscendPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  let flowFromBusiness: number | undefined;
  if (
    typeof body.businessStabilityScore === "number" &&
    typeof body.leadershipScore === "number"
  ) {
    flowFromBusiness =
      (body.businessStabilityScore + body.leadershipScore) / 2;
  } else if (typeof body.businessStabilityScore === "number") {
    flowFromBusiness = body.businessStabilityScore;
  } else if (typeof body.leadershipScore === "number") {
    flowFromBusiness = body.leadershipScore;
  }

  let profile;
  if (typeof flowFromBusiness === "number") {
    profile = await setFlowScore(userId, flowFromBusiness);
    profile = await updateAscendProfile(userId, { stage: "BUSINESS" });
  }

  if (!profile) {
    return NextResponse.json(
      { error: "No recognised fields in payload" },
      { status: 400 }
    );
  }

  return NextResponse.json(profile);
}
