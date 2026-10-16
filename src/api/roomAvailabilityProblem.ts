import { type ProblemDetails, parseProblemDetails } from "./problemDetails.ts";

export type RoomAvailabilityProblem = ProblemDetails;

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

export const parseRoomAvailabilityProblem = parseProblemDetails;

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
