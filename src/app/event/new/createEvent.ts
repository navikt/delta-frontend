"use server";

import { getAuthApi } from "@/api/instance";
import { DeltaEvent } from "@/types/event";
import { CreateEventSchema } from "./createEventForm";

export async function createEvent(
  formData: CreateEventSchema,
): Promise<DeltaEvent> {
  const api = await getAuthApi();

  const response = await api.put("/admin/event", {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    startTime: `${formData.startDate.toISOString().substring(0, 10)}T${
      formData.startTime
    }:00`,
    endTime: `${formData.endDate.toISOString().substring(0, 10)}T${
      formData.endTime
    }:00`,
  });
  console.log(`${Date.now()}: got response`);

  return response.data;
}
