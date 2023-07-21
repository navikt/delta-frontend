"use server";

import { getAuthApi, getAuthlessApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  CreateDeltaEvent,
  DeltaEvent,
  DeltaEventWithParticipant,
} from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";

export async function joinEvent(eventId: string) {
  const api = await getAuthApi();
  const response = await api.post(`/user/event/${eventId}`);
}

export async function leaveEvent(eventId: string) {
  const api = await getAuthApi();
  const response = await api.delete(`/user/event/${eventId}`);
}

export async function deleteEvent(eventId: string) {
  const api = await getAuthApi();
  await api.delete(`/admin/event/${eventId}`);
}

export async function deleteParticipant(eventId: string) {
  const api = await getAuthApi();
  await api.delete(`/admin/event/${eventId}/participant`);
}

export async function getEvent(id: string): Promise<DeltaEventWithParticipant> {
  const api = await getAuthlessApi();
  const response = await api.get(`/event/${id}`);
  return response.data;
}

export async function createEvent(
  formData: CreateEventSchema
): Promise<DeltaEvent> {
  const api = await getAuthApi();

  const start = `${formatInTimeZone(
    formData.startDate,
    "Europe/Oslo",
    "yyyy-MM-dd"
  )}T${formData.startTime}:00Z`;

  const end = `${formatInTimeZone(
    formData.endDate,
    "Europe/Oslo",
    "yyyy-MM-dd"
  )}T${formData.endTime}:00Z`;

  const response = await api.put("/admin/event", {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    public: formData.public,
    participantLimit: 0,
    startTime: start,
    endTime: end,
  } satisfies CreateDeltaEvent);

  return response.data;
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string
): Promise<DeltaEvent> {
  const api = await getAuthApi();

  const start = `${formatInTimeZone(
    formData.startDate,
    "Europe/Oslo",
    "yyyy-MM-dd"
  )}T${formData.startTime}:00Z`;

  const end = `${formatInTimeZone(
    formData.endDate,
    "Europe/Oslo",
    "yyyy-MM-dd"
  )}T${formData.endTime}:00Z`;

  const response = await api.post(`/admin/event/${eventId}`, {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    public: formData.public,
    participantLimit: 0,
    startTime: start,
    endTime: end,
  } satisfies CreateDeltaEvent);

  return response.data;
}
