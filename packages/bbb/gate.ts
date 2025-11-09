import type { NextRequest } from "next/server";

export function withBBB(
  _direction: "INBOUND" | "OUTBOUND",
  _scope: string,
  handler: (request: NextRequest) => Response | Promise<Response>
): (request: NextRequest) => Response | Promise<Response> {
  // TODO: add auth/telemetry/etc. For now return the handler verbatim.
  return handler;
}