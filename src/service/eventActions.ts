"use server";

import { getApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  CreateDeltaEvent,
  DeltaEvent,
  DeltaEventWithParticipant,
} from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";

export async function joinEvent(eventId: string) {
  const api = await getApi();
  const response = await api.post(`/user/event/${eventId}`);
}

export async function leaveEvent(eventId: string) {
  const api = await getApi();
  const response = await api.delete(`/user/event/${eventId}`);
}

export async function deleteEvent(eventId: string) {
  const api = await getApi();
  await api.delete(`/admin/event/${eventId}`);
}

export async function deleteParticipant(eventId: string) {
  const api = await getApi();
  await api.delete(`/admin/event/${eventId}/participant`);
}

export async function getEvents(
  onlyFuture: boolean,
  onlyMine: boolean,
  onlyJoined: boolean,
): Promise<DeltaEvent[]> {
  const api = await getApi();
  const response = await api.get<DeltaEvent[]>("/event", {
    params: {
      onlyFuture,
      onlyJoined,
      onlyMine,
    },
  });
  return response.data;
}

export async function getEvent(id: string): Promise<DeltaEventWithParticipant> {
  const api = await getApi();
  const response = await api.get(`/event/${id}`);
  return response.data;
}

export async function createEvent(
  formData: CreateEventSchema,
): Promise<DeltaEvent> {
  const api = await getApi();

  const createEvent = createDeltaEventFromFormData(formData);
  const response = await api.put("/admin/event", createEvent);

  return response.data;
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string,
): Promise<DeltaEvent> {
  const api = await getApi();

  const createEvent = createDeltaEventFromFormData(formData);
  const response = await api.post(`/admin/event/${eventId}`, createEvent);

  return response.data;
}

function createDeltaEventFromFormData(
  formData: CreateEventSchema,
): CreateDeltaEvent {
  const start = `${formatInTimeZone(
    formData.startDate,
    "Europe/Oslo",
    "yyyy-MM-dd",
  )}T${formData.startTime}:00Z`;

  const end = `${formatInTimeZone(
    formData.endDate,
    "Europe/Oslo",
    "yyyy-MM-dd",
  )}T${formData.endTime}:00Z`;

  const deadline = formData.signupDeadlineDate
    ? `${formatInTimeZone(
        formData.signupDeadlineDate,
        "Europe/Oslo",
        "yyyy-MM-dd",
      )}T${formData.signupDeadlineTime}:00Z`
    : undefined;

  return {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    public: formData.public,
    participantLimit:
      formData.hasParticipantLimit && formData.participantLimit
        ? parseInt(formData.participantLimit)
        : 0,
    startTime: start,
    endTime: end,
    signupDeadline: formData.hasSignupDeadline ? deadline : undefined,
  };
}
