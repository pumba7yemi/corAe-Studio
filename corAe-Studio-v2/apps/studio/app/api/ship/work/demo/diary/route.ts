// Simple in-file demo guard to avoid external module resolution errors
const withDemoGuard = <T extends (...args: any[]) => Promise<Response> | Response>(handler: T): T => {
  return (async (...args: any[]) => {
    // Demo guard could perform checks here; in demo mode we just forward to handler
    return (await handler(...args as any)) as any;
  }) as any as T;
};
export const runtime = "nodejs";

export const GET = withDemoGuard(async () => {
  const steps = [
    "Have you reviewed 3 priority tasks? (Demo)",
    "If no → open 3³DTD planner (Demo)",
    "If yes → move to next Work Focus (Demo)",
  ];
  return Response.json({ data: steps, demo: true });
});
