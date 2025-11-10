import { memoryPulseStore } from "@corae/core-pulse";
export const runtime = "nodejs";

export async function GET() {
  const summary = memoryPulseStore.getSummary();
  return Response.json({ summary });
}
