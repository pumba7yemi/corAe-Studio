// apps/studio/prisma/seed/seed_obari_finance.ts
import { PrismaClient, InvoiceDirection, ScheduleMode, WeekRef, ReportStatus, InvoiceStatus, PaymentPlan } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- 1) Schedule (W1 example) ---
  const start = new Date();                     // today as start (simplified)
  const end = new Date(start.getTime() + 6 * 24 * 3600 * 1000); // +6 days

  const schedule = await prisma.obariSchedule.upsert({
    where: { id: "seed-w1" }, // fake stable id via upsert guard
    update: {},
    create: {
      id: "seed-w1",
      mode: ScheduleMode.CYCLE_28,
      label: "Seed • W1",
      startDate: start,
      endDate: end,
      weekRef: WeekRef.W1,
      year: start.getFullYear(),
      notes: "Seeded W1 schedule",
    },
  });

  // --- 2) POS Item (Product0001) ---
  const item = await prisma.item.upsert({
    where: { sku: "Product0001" },
    update: {},
    create: {
      sku: "Product0001",
      name: "Seed Product",
      unit: "EA",
      vatRatePc: "5.00" as any,
      primaryVendorCode: "Vendor0001",
      prices: {
        create: [{ listPrice: "10.0000" as any, costPrice: "7.5000" as any }],
      },
    },
  });

  // --- 3) OBARI Order (PURCHASE -> PO00001) ---
  const order = await prisma.obariOrder.create({
    data: {
      code: "PO00001",
      direction: InvoiceDirection.PURCHASE,
      scheduleId: schedule.id,
      expectedWeek: WeekRef.W1,
      scheduleMode: ScheduleMode.CYCLE_28,
      vendorCode: "Vendor0001",
      itemCode: item.sku,
      description: "Initial stock top-up",
      qty: "100" as any,
      unit: "EA",
      unitPrice: "7.50" as any,
      currency: "AED",
      taxCode: "VAT5",
    },
  });

  // --- 4) Booking ---
  const booking = await prisma.obariBooking.create({
    data: {
      bookingRef: "BK00001",
      orderId: order.id,
      scheduleId: schedule.id,
      datePlanned: new Date(),
      location: "Main Store",
      docs: {
        create: [
          { kind: "INV", status: "REQUIRED" },
          { kind: "POD", status: "REQUIRED" },
        ] as any,
      },
    },
  });

  // --- 5) Active Event (delivered) ---
  await prisma.activeEvent.create({
    data: {
      bookingId: booking.id,
      scheduleId: schedule.id,
      happenedAt: new Date(),
      actor: "Vendor0001",
      qtyDone: "100" as any,
      unit: "EA",
      notes: "Delivered complete.",
    },
  });

  // --- 6) Report (approved) ---
  const subtotal = 100 * 7.5; // 750
  const tax = subtotal * 0.05; // 37.5
  const grand = subtotal + tax; // 787.5

  const report = await prisma.obariReport.create({
    data: {
      bookingId: booking.id,
      scheduleId: schedule.id,
      status: ReportStatus.APPROVED,
      derivedFromDocs: true,
      subtotal: String(subtotal) as any,
      taxTotal: String(tax) as any,
      grandTotal: String(grand) as any,
      damages: { create: [] },
      variances: { create: [] },
      approvedBy: "seed",
      approvedAt: new Date(),
    },
  });

  // --- 7) Invoice (issued, BILL_TO_BILL plan) ---
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo: "INV-PO00001",
      direction: InvoiceDirection.PURCHASE,
      scheduleId: schedule.id,
      orderId: order.id,
      bookingId: booking.id,
      reportId: report.id,
      vendorCode: "Vendor0001",
      currency: "AED",
      subtotal: String(subtotal) as any,
      taxTotal: String(tax) as any,
      grandTotal: String(grand) as any,
      vatRate: "5.00" as any,
      status: InvoiceStatus.ISSUED,
      issuedAt: new Date(),
      paymentPlan: PaymentPlan.BILL_TO_BILL,
      notes: "Seed invoice for PO00001",
    },
  });

  console.log("✅ Seed complete:");
  console.log({ schedule: schedule.id, item: item.sku, order: order.code, booking: booking.bookingRef, report: report.id, invoice: invoice.invoiceNo });
}

main()
  .catch((e) => {
    console.error("Seed error", e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
