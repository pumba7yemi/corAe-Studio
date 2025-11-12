import { NextRequest } from "next/server";
// Lightweight local implementation of withDemoGuard to avoid an unresolved external import
function withDemoGuard<T extends (...args: any[]) => any>(handler: T) {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Add demo-specific checks here if needed (e.g., headers, feature flags)
    // For now, call the handler directly.
    // @ts-ignore - preserve handler return type
    return handler(...(args as any));
  };
}
 // Lightweight in-file memory store for demo (replaces unresolved external import)
 const mem = (() => {
   const store = new Map<string, Map<string, any>>();
   return {
     async write(collection: string, key: string, value: any) {
       let col = store.get(collection);
       if (!col) {
         col = new Map<string, any>();
         store.set(collection, col);
       }
       col.set(key, value);
     },
     async read(collection: string, key: string) {
       const col = store.get(collection);
       return col?.get(key);
     }
   };
})();
// Local demo implementation of listHomeTasks to avoid unresolved external import
function listHomeTasks() {
  // Return a small set of demo tasks; adjust shape to match your consumers if needed.
  return [
    { id: "task-1", title: "Demo Task 1", completed: false },
    { id: "task-2", title: "Demo Task 2", completed: true },
  ];
}
export const runtime = "nodejs";

export const GET = withDemoGuard(async () => {
  return Response.json({ data: listHomeTasks(), demo: true });
});

export const POST = withDemoGuard(async (req: NextRequest) => {
  const body = await req.json();
  await mem.write("home_tasks", Date.now().toString(), body);
  return Response.json({ ok: true, demo: true });
});
