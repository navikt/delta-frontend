"use server";

import { getAuthApi } from "@/api/instance";
import { DeltaEvent } from "@/types/event";
import { CreateEventSchema } from "./createEventForm";
import { adjustTimezoneForward } from "@/components/format";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { parse } from "date-fns";

export async function createEvent(
  formData: CreateEventSchema,
): Promise<DeltaEvent> {
  const api = await getAuthApi();

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

  const response = await api.put("/admin/event", {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    startTime: start,
    endTime: end,
  });
  console.log(`${Date.now()}: got response`);

  return response.data;
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string,
): Promise<DeltaEvent> {
  const api = await getAuthApi();

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

  const response = await api.post(`/admin/event/${eventId}`, {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    startTime: start,
    endTime: end,
  });
  console.log(`${Date.now()}: got response`);

  return response.data;
}
