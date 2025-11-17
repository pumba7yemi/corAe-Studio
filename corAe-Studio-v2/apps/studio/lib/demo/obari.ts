export function sampleObari() {
  return {
    orders:   [{ id: "PO-1001", vendor: "Iffco", status: "Confirmed (Demo)" }],
    bookings: [{ id: "BK-2001", slot: "Thu 10:00", status: "Scheduled (Demo)" }],
    invoices: [{ id: "INV-3001", amount: 420.0, status: "Draft (Demo)" }],
  };
}
