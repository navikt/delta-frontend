"use server";

import { checkToken, getUser } from "@/auth/token";
import { getApi } from "@/api/instance";
import { getEvent } from "./eventQueries";
import { getInvitationCapacity, type InvitationCapacity } from "./eventCapacity";
import type { DeltaParticipant, DirectoryPerson } from "@/types/event";
import type { ActionResult } from "@/types/room";
import { AxiosError } from "axios";

export async function getEventRegistrationState(eventId: string): Promise<{
  participants: DeltaParticipant[];
  invitationCapacity: InvitationCapacity;
}> {
  await checkToken();
  const [event, user] = await Promise.all([getEvent(eventId), getUser()]);
  return {
    participants: event.participants,
    invitationCapacity: getInvitationCapacity(event.participants, event.hosts, event.invited,
      user.email, event.event.signupDeadline),
  };
}

export async function searchPeople(query: string): Promise<ActionResult<DirectoryPerson[]>> {
  await checkToken();
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return { ok: true, data: [] };
  const api = await getApi();
  try {
    const response = await api.get<DirectoryPerson[]>("/directory/search", {
      params: { q: normalizedQuery.slice(0, 100) },
    });
    return { ok: true, data: response.data };
  } catch (error) {
    const status = error instanceof AxiosError ? error.status : undefined;
    console.error("Person search failed", { status });
    return { ok: false, status, message: "Kunne ikke søke etter personer. Prøv igjen." };
  }
}
