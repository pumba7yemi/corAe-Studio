declare module "next/server" {
  export type NextRequest = Request & { nextUrl: URL };
  export class NextResponse extends Response {
    /** Create a JSON response */
    static json(data: any, init?: ResponseInit & { status?: number }): NextResponse;

    /** Redirect helpers with flexible overloads used across the codebase */
    static redirect(url: string | URL, status?: number | (ResponseInit & { status?: number })): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit & { status?: number; headers?: HeadersInit }): NextResponse;

    /** Signal to continue to the next middleware/handler (Next.js server flow) */
    static next(): NextResponse;
  }
}
