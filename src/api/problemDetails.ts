export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string | null;
  upstreamStatus?: number | null;
  requestId?: string | null;
};

export const MAX_ERROR_MESSAGE_LENGTH = 500;

export function parseProblemDetails(data: unknown): ProblemDetails | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;

  const body = data as Record<string, unknown>;
  const problem: ProblemDetails = {};
  if (typeof body.type === "string") problem.type = body.type;
  if (typeof body.title === "string") problem.title = body.title;
  if (typeof body.status === "number") problem.status = body.status;
  if (typeof body.detail === "string") problem.detail = body.detail;
  if (typeof body.code === "string" || body.code === null) problem.code = body.code;
  if (typeof body.upstreamStatus === "number" || body.upstreamStatus === null) {
    problem.upstreamStatus = body.upstreamStatus;
  }
  if (typeof body.requestId === "string" || body.requestId === null) {
    problem.requestId = body.requestId;
  }

  return Object.keys(problem).length > 0 ? problem : undefined;
}

function clean(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_ERROR_MESSAGE_LENGTH) : undefined;
}

// Accepts problem+json, legacy JSON bodies and plain text. Priority: detail, message, error.
export function extractErrorMessage(body: unknown): string | undefined {
  if (typeof body === "string") return clean(body);
  if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
  const record = body as Record<string, unknown>;
  return clean(record.detail) ?? clean(record.message) ?? clean(record.error);
}

// Parses a raw response body that may be JSON or plain text.
export function parseErrorBody(text: string): {
  message?: string;
  problem?: ProblemDetails;
} {
  if (!text) return {};
  try {
    const data: unknown = JSON.parse(text);
    return { message: extractErrorMessage(data), problem: parseProblemDetails(data) };
  } catch {
    return { message: extractErrorMessage(text) };
  }
}
