export class CimsError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "CimsError";
    this.status = status;
    this.details = details;
  }
}

export const json = (data: unknown, init: number | ResponseInit = 200) => {
  const status = typeof init === "number" ? init : init?.status ?? 200;
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

export default {
  CimsError,
  json,
};
