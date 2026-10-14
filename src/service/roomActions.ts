"use server";

import { getApi } from "@/api/instance";
import { toRoomAvailabilityFailure } from "@/api/roomAvailabilityProblem";
import { ActionResult, RoomAvailability, RoomInfo } from "@/types/room";
import { AxiosError } from "axios";
import { checkToken } from "@/auth/token";

export async function searchRooms(q: string): Promise<ActionResult<RoomInfo[]>> {
  await checkToken();
  const query = q.trim();
  if (query.length < 2) {
    return { ok: true, data: [] };
  }
  try {
    const api = await getApi();
    const response = await api.get<RoomInfo[]>("/rooms/search", {
      params: { q: query.slice(0, 100), limit: 25 },
    });
    return { ok: true, data: response.data };
  } catch (error) {
    return toRoomErrorResult(error, "Kunne ikke søke etter rom.");
  }
}

/** startTime/endTime in the backend's local event time format (yyyy-MM-ddTHH:mm:00Z). */
export async function getRoomAvailability(
  roomEmails: string[],
  startTime: string,
  endTime: string,
): Promise<ActionResult<RoomAvailability[]>> {
  await checkToken();
  if (roomEmails.length === 0) {
    return { ok: true, data: [] };
  }
  try {
    const api = await getApi();
    const response = await api.post<RoomAvailability[]>("/rooms/availability", {
      roomEmails,
      startTime,
      endTime,
      availabilityViewInterval: 15,
    });
    return { ok: true, data: response.data };
  } catch (error) {
    console.error("Room API error:", error);
    if (error instanceof AxiosError) {
      const roomError = error as AxiosError & {
        responseMessage?: string;
        responseData?: unknown;
      };
      return toRoomAvailabilityFailure(
        error.status,
        roomError.responseMessage,
        roomError.responseData,
        "Kunne ikke hente ledighet for rommet.",
      );
    }
    return { ok: false, message: "Kunne ikke hente ledighet for rommet." };
  }
}

function toRoomErrorResult(
  error: unknown,
  fallback: string,
): { ok: false; status?: number; message: string } {
  console.error("Room API error:", error);
  const status = error instanceof AxiosError ? error.status : undefined;
  if (status === 502) {
    return { ok: false, status, message: `${fallback} Microsoft-tjenesten svarer ikke – prøv igjen.` };
  }
  if (status === 400) {
    const backendMessage = (error as AxiosError & { responseMessage?: string }).responseMessage;
    return { ok: false, status, message: backendMessage || fallback };
  }
  return { ok: false, status, message: fallback };
}
