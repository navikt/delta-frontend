"use server";

import { checkToken } from "@/auth/token";
import { getApi } from "@/api/instance";
import { getEventRegistrationState } from "./eventInteractiveReads";
import type { WaitlistEntry } from "@/types/event";
import type { ActionResult } from "@/types/room";
import { AxiosError } from "axios";
import { unstable_rethrow } from "next/navigation";

type RegistrationState = Awaited<ReturnType<typeof getEventRegistrationState>>;

function actionError(error: unknown, fallback = "Kunne ikke endre ventelisten. Prøv igjen."): { ok: false; status?: number; message: string } {
  unstable_rethrow(error);
  const status = error instanceof AxiosError ? error.status : undefined;
  const message = error instanceof AxiosError && "responseMessage" in error && typeof error.responseMessage === "string"
    ? error.responseMessage : undefined;
  console.error("Waitlist action failed", { status });
  return { ok: false, status, message: message || fallback };
}

export async function changeWaitlist(eventId: string, leave: boolean): Promise<ActionResult<RegistrationState>> {
  await checkToken();
  try {
    const api = await getApi();
    const path = `/user/event/${encodeURIComponent(eventId)}/waitlist`;
    await (leave ? api.delete(path) : api.post(path));
    return { ok: true, data: await getEventRegistrationState(eventId) };
  } catch (error) {
    return actionError(error);
  }
}

export async function changeEventRegistration(eventId: string, leave: boolean): Promise<ActionResult<RegistrationState>> {
  await checkToken();
  try {
    const api = await getApi();
    const path = `/user/event/${encodeURIComponent(eventId)}`;
    await (leave ? api.delete(path) : api.post(path));
    return { ok: true, data: await getEventRegistrationState(eventId) };
  } catch (error) {
    return actionError(error, "Kunne ikke endre påmeldingen. Prøv igjen.");
  }
}

export async function removeWaitlistEntry(eventId: string, email: string): Promise<ActionResult<WaitlistEntry[]>> {
  await checkToken();
  try {
    const api = await getApi();
    const response = await api.delete<WaitlistEntry[]>(`/admin/event/${encodeURIComponent(eventId)}/waitlist`,
      { data: { email } });
    return { ok: true, data: response.data };
  } catch (error) {
    return actionError(error);
  }
}
