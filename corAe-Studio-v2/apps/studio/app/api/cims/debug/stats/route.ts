import { NextResponse } from "next/server";
import { CIMSStore } from "@/app/lib/cims/store";
export async function GET() {
  const [inbox,outbox,signals] = await Promise.all([
    CIMSStore.inbox.list("all"),
    CIMSStore.outbox.list("all"),
    CIMSStore.signals.list("all")
  ]);
  return NextResponse.json({
    ok:true,
    counts:{ inbox:inbox.length, outbox:outbox.length, signals:signals.length },
    at:new Date().toISOString()
  });
}
