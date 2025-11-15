import { NextRequest, NextResponse } from "next/server";
import {
  AscendProfileUpdate,
  getAscendProfile,
  updateAscendProfile,
} from "../../../../../packages/caia-core/context/ascend";

function getUserId(_req: NextRequest): string {
  // Replace with real auth integration later.
  return "demo-user";
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  const profile = await getAscendProfile(userId);
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const patch = body as AscendProfileUpdate;
  const profile = await updateAscendProfile(userId, patch);

  return NextResponse.json(profile);
}
