import { NextRequest, NextResponse } from "next/server";
import {
  addAscendIncome,
  updateAscendProfile,
} from "../../../../../packages/caia-core/context/ascend";

function getUserId(_req: NextRequest): string {
  return "demo-user";
}

type CreatorAscendPayload = {
  /** new income amount coming from Creator-level activities */
  incomeEarned?: number;
  /** optional flag to mark user as Creator regardless of current stage */
  markCreator?: boolean;
};

export async function POST(req: NextRequest) {
  const userId = getUserId(req);

  let body: CreatorAscendPayload;
  try {
    body = (await req.json()) as CreatorAscendPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  let profile;
  if (typeof body.incomeEarned === "number") {
    profile = await addAscendIncome(userId, body.incomeEarned);
  }

  if (body.markCreator) {
    profile = await updateAscendProfile(userId, { stage: "CREATOR" });
  }

  if (!profile) {
    return NextResponse.json(
      { error: "No recognised fields in payload" },
      { status: 400 }
    );
  }

  return NextResponse.json(profile);
}
