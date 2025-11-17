import { prisma } from "@/lib/prisma";
import { InvoiceDirection, ScheduleMode, WeekRef } from "@prisma/client";

export async function issueOrder({
  direction, itemCode, description, qty, unitPrice, expectedWeek, scheduleMode, vendorCode, notes,
}: {
  direction: "PURCHASE" | "SALES";
  itemCode: string; description: string; qty: any; unitPrice?: any;
  expectedWeek?: WeekRef; scheduleMode?: ScheduleMode; vendorCode?: string; notes?: string;
}) {
  const code = `PO${Date.now().toString().slice(-6)}`;
  const order = await prisma.obariOrder.create({
    data: { code, direction: direction as InvoiceDirection, itemCode, description, qty, unitPrice, expectedWeek, scheduleMode, vendorCode, notes },
  });
  return order;
}
