"use server";

import { checkToken } from "@/auth/token";
import { getApi } from "@/api/instance";
import { getEventRegistrationState } from "./eventInteractiveReads";
import type { WaitlistEntry } from "@/types/event";
import type { ActionResult } from "@/types/room";
import { AxiosError } from "axios";
import { unstable_rethrow } from "next/navigation";

type RegistrationState = Awaited<ReturnType<typeof getEventRegistrationState>>;
type RegistrationMutationResult =
  | { ok: true; refreshRequired: false; data: RegistrationState }
  | { ok: true; refreshRequired: true }
  | Extract<ActionResult<never>, { ok: false }>;

function actionError(error: unknown, fallback = "Kunne ikke endre ventelisten. Prøv igjen."): { ok: false; status?: number; message: string } {
  unstable_rethrow(error);
  const status = error instanceof AxiosError ? error.status : undefined;
  const message = error instanceof AxiosError && "responseMessage" in error && typeof error.responseMessage === "string"
    ? error.responseMessage : undefined;
  console.error("Waitlist action failed", { status });
  return { ok: false, status, message: message || fallback };
}

export async function refreshEventRegistration(eventId: string): Promise<ActionResult<RegistrationState>> {
  await checkToken();
  try {
    return { ok: true, data: await getEventRegistrationState(eventId) };
  } catch (error) {
    return actionError(error, "Kunne ikke hente påmeldingsstatusen. Prøv igjen.");
  }
}

async function registrationAfterMutation(eventId: string): Promise<RegistrationMutationResult> {
  const refreshed = await refreshEventRegistration(eventId);
  return refreshed.ok
    ? { ok: true, refreshRequired: false, data: refreshed.data }
    : { ok: true, refreshRequired: true };
}

export async function changeWaitlist(eventId: string, leave: boolean): Promise<RegistrationMutationResult> {
  await checkToken();
  try {
    const api = await getApi();
    const path = `/user/event/${encodeURIComponent(eventId)}/waitlist`;
    await (leave ? api.delete(path) : api.post(path));
  } catch (error) {
    return actionError(error);
  }
  return registrationAfterMutation(eventId);
}

export async function changeEventRegistration(eventId: string, leave: boolean): Promise<RegistrationMutationResult> {
  await checkToken();
  try {
    const api = await getApi();
    const path = `/user/event/${encodeURIComponent(eventId)}`;
    await (leave ? api.delete(path) : api.post(path));
  } catch (error) {
    return actionError(error, "Kunne ikke endre påmeldingen. Prøv igjen.");
  }
  return registrationAfterMutation(eventId);
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
