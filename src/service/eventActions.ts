"use server";

import { getAuthApi, getAuthlessApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  CreateDeltaEvent,
  DeltaEvent,
  DeltaEventWithParticipant,
} from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";
import ShortUUID from "short-uuid";

const translator = ShortUUID();

export async function joinEvent(eventId: string) {
  const api = await getAuthApi();
  const response = await api.post(`/user/event/${translator.toUUID(eventId)}`);
}

export async function leaveEvent(eventId: string) {
  const api = await getAuthApi();
  const response = await api.delete(
    `/user/event/${translator.toUUID(eventId)}`
  );
}

export async function deleteEvent(eventId: string) {
  const api = await getAuthApi();
  await api.delete(`/admin/event/${translator.toUUID(eventId)}`);
}

export async function deleteParticipant(eventId: string) {
  const api = await getAuthApi();
  await api.delete(`/admin/event/${translator.toUUID(eventId)}/participant`);
}

export async function getEvent(id: string): Promise<DeltaEventWithParticipant> {
  const api = await getAuthlessApi();
  const response = await api.get(`/event/${translator.toUUID(id)}`);

  const eventWithParticipant: DeltaEventWithParticipant = response.data;
  eventWithParticipant.event.id = translator.fromUUID(
    eventWithParticipant.event.id
  );
  return eventWithParticipant;
}

export async function getEvents(): Promise<DeltaEvent[]> {
  const api = await getAuthlessApi();
  const response = await api.get<DeltaEvent[]>(`/event`);

  const events = response.data;
  events.forEach(e => e.id = translator.fromUUID(e.id));
  return events;
}

export async function getMyEvents(): Promise<DeltaEvent[]> {
  const api = await getAuthApi();
  const response = await api.get<DeltaEvent[]>(`/admin/event`);

  const events = response.data;
  events.forEach(e => e.id = translator.fromUUID(e.id));
  return events;
}

export async function getJoinedEvents(): Promise<DeltaEvent[]> {
  const api = await getAuthApi();
  const response = await api.get<DeltaEvent[]>(`/user/event`);

  const events = response.data;
  events.forEach(e => e.id = translator.fromUUID(e.id));
  return events;
}

export async function createEvent(
  formData: CreateEventSchema
): Promise<DeltaEvent> {
  const api = await getAuthApi();

  const createEvent = createDeltaEventFromFormData(formData);
  const response = await api.put("/admin/event", createEvent);

  const event: DeltaEvent = response.data;
  event.id = translator.fromUUID(event.id);
  return event;
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string
): Promise<DeltaEvent> {
  const api = await getAuthApi();

  const createEvent = createDeltaEventFromFormData(formData);
  const response = await api.post(
    `/admin/event/${translator.toUUID(eventId)}`,
    createEvent
  );

  const event: DeltaEvent = response.data;
  event.id = translator.fromUUID(event.id);
  return event;
}

function createDeltaEventFromFormData(
  formData: CreateEventSchema
): CreateDeltaEvent {
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

  const deadline = formData.signupDeadlineDate
    ? `${formatInTimeZone(
        formData.signupDeadlineDate,
        "Europe/Oslo",
        "yyyy-MM-dd"
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
