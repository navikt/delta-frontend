import "server-only";
import { getApi } from "@/api/instance";
import { ApiError } from "./eventListTransport";
import type { MyWaitlistEvent, WaitlistEntry, WaitlistState } from "@/types/event";
import { AxiosError } from "axios";

async function readWaitlist<T>(path: string): Promise<T> {
  const api = await getApi();
  try {
    return (await api.get<T>(path)).data;
  } catch (error) {
    const status = error instanceof AxiosError ? error.status : undefined;
    console.error("Waitlist query failed", { status });
    throw new ApiError("ventelisten", status);
  }
}

export function getWaitlistState(eventId: string) {
  return readWaitlist<WaitlistState>(`/user/event/${encodeURIComponent(eventId)}/waitlist`);
}

export function getWaitlistEntries(eventId: string) {
  return readWaitlist<WaitlistEntry[]>(`/admin/event/${encodeURIComponent(eventId)}/waitlist`);
}

export function getMyWaitlists() {
  return readWaitlist<MyWaitlistEvent[]>("/user/waitlist");
}
