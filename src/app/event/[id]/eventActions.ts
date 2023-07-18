"use server";

import { getAuthApi, getAuthlessApi } from "@/api/instance";
import { DeltaEventWithParticipant } from "@/types/event";

export async function joinEvent(eventId: string) {
  const api = await getAuthApi();
  const response = await api.post(`/user/event/${eventId}`);
}

export async function leaveEvent(eventId: string) {
  const api = await getAuthApi();
  const response = await api.delete(`/user/event/${eventId}`);
}

export async function deleteEvent(formDate: FormData) {
  const api = await getAuthApi();
  await api.delete(`/admin/event/${formDate.get("id")}`);
}

export async function getEvent(id: string): Promise<DeltaEventWithParticipant> {
  const api = await getAuthlessApi();
  const response = await api.get(`/event/${id}`);
  return response.data;
}
