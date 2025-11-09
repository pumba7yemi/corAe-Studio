// Temporary stub for @prisma/client to silence missing-model member errors
// during local development. Replace by real generated client when available.
declare module "@prisma/client" {
  export class PrismaClient {
    constructor(...args: any[]);
    [key: string]: any;
  }

  // Export common enum placeholders (used in seeds)
  export const InvoiceDirection: any;
  export const ScheduleMode: any;
  export const WeekRef: any;
  export const ReportStatus: any;
  export const InvoiceStatus: any;
  export const PaymentPlan: any;

  export default PrismaClient;
}
