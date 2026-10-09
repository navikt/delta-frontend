export type RoomAvailabilityProblem = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string | null;
  upstreamStatus?: number | null;
  requestId?: string | null;
};

export type RoomAvailabilityFailure = {
  ok: false;
  status?: number;
  message: string;
  type?: string;
  title?: string;
  detail?: string;
  code?: string | null;
  upstreamStatus?: number | null;
  requestId?: string | null;
};

export function parseRoomAvailabilityProblem(data: unknown): RoomAvailabilityProblem | undefined {
  if (!data || typeof data !== "object" || Array.isArray(data)) return undefined;

  const body = data as Record<string, unknown>;
  const problem: RoomAvailabilityProblem = {};
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

export function toRoomAvailabilityFailure(
  status: number | undefined,
  responseMessage: string | undefined,
  responseData: unknown,
  fallback: string,
): RoomAvailabilityFailure {
  const problem = parseRoomAvailabilityProblem(responseData);
  return {
    ok: false,
    ...problem,
    status: problem?.status ?? status,
    message: problem?.detail?.trim() || responseMessage || fallback,
  };
}

export function roomAvailabilityErrorMessage(
  error: Pick<RoomAvailabilityFailure, "code" | "detail" | "message">,
): string {
  if (error.code === "ErrorInvalidMergedFreeBusyInterval") {
    return "Kunne ikke hente ledighet for rommet. Microsoft avviste tidsrommet. Juster start- og sluttidspunktet, og prøv igjen.";
  }
  return error.detail?.trim() || error.message;
}
