import { NextRequest } from "next/server";
import { listTasks } from "@corae/core-3cubed";

export async function GET(_: NextRequest) {
  try {
    const tasks = await listTasks();
    return Response.json({ ok: true, tasks });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 500 });
  }
}
