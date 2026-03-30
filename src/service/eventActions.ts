"use server";

import { getApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  ChangeDeltaParticipant,
  CreateDeltaEvent,
  EditScope,
  FullDeltaEvent,
} from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";
import { AxiosError } from "axios";
import { updateTag } from "next/cache";
import {
  ApiError,
  handleApiError,
  validateEventId,
  getEvents as _getEvents,
  getEvent as _getEvent,
  getAllCategories as _getAllCategories,
} from "./eventQueries";
import type { Category } from "@/types/event";

// Server action wrappers for read functions (callable from client components)
export async function getEvents(filters?: {
  categories?: Category[];
  onlyFuture?: boolean;
  onlyPast?: boolean;
  onlyMine?: boolean;
  onlyJoined?: boolean;
}): Promise<Awaited<ReturnType<typeof _getEvents>>> {
  return _getEvents(filters ?? {});
}

export async function getEvent(
  eventId: string,
): Promise<Awaited<ReturnType<typeof _getEvent>>> {
  return _getEvent(eventId);
}

export async function getAllCategories(): Promise<
  Awaited<ReturnType<typeof _getAllCategories>>
> {
  return _getAllCategories();
}

export async function joinEvent(eventId: string): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.post(`/user/event/${eventId}`);
    updateTag("events");
    updateTag(`event-${eventId}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 500) {
      console.error("Server error while joining event:", error);
      throw new ApiError(
        "Kunne ikke melde deg på arrangementet. Vennligst prøv igjen senere.",
      );
    }
    throw handleApiError(error);
  }
}

export async function leaveEvent(eventId: string): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.delete(`/user/event/${eventId}`);
    updateTag("events");
    updateTag(`event-${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteEvent(
  eventId: string,
  editScope?: EditScope,
): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.delete(`/admin/event/${eventId}`, {
      ...(editScope ? { params: { editScope } } : {}),
    });
    updateTag("events");
    updateTag(`event-${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteParticipant(
  eventId: string,
  userEmail: string,
): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    const payload = { email: userEmail };
    await api.delete(`/admin/event/${eventId}/participant`, { data: payload });
    updateTag("events");
    updateTag(`event-${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function changeParticipant(
  eventId: string,
  changeDeltaParticipant: ChangeDeltaParticipant,
): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.post(
      `/admin/event/${eventId}/participant`,
      changeDeltaParticipant,
    );
    updateTag("events");
    updateTag(`event-${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function createCategory(category: string): Promise<Category> {
  try {
    const api = await getApi();
    const response = await api.put<Category>("/category", { name: category });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function setCategories(
  eventId: string,
  categories: number[],
): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.post<string>(`/admin/event/${eventId}/category`, categories);
    updateTag("events");
    updateTag(`event-${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function createEvent(
  formData: CreateEventSchema,
): Promise<FullDeltaEvent> {
  try {
    const api = await getApi();
    const event = createDeltaEventFromFormData(formData);
    const response = await api.put("/admin/event", event);
    updateTag("events");
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string,
  editScope?: EditScope,
): Promise<FullDeltaEvent> {
  try {
    validateEventId(eventId);
    const api = await getApi();

    const event = createDeltaEventFromFormData(formData);
    if (editScope) {
      event.editScope = editScope;
    }
    const response = await api.post(`/admin/event/${eventId}`, event);
    updateTag("events");
    updateTag(`event-${eventId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
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

  const sendNotificationEmail = formData.sendNotificationEmail;

  const recurrence =
    formData.isRecurring &&
    formData.recurrenceFrequency &&
    formData.recurrenceUntilDate
      ? {
          frequency: formData.recurrenceFrequency,
          untilDate: formatInTimeZone(
            formData.recurrenceUntilDate,
            "Europe/Oslo",
            "yyyy-MM-dd",
          ),
          ...(formData.hasSignupDeadline && formData.signupDeadlineOffsetDays
            ? {
                signupDeadlineOffsetDays: parseInt(
                  formData.signupDeadlineOffsetDays,
                ),
              }
            : {}),
        }
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
    signupDeadline:
      formData.hasSignupDeadline && !formData.isRecurring ? deadline : undefined,
    sendNotificationEmail: sendNotificationEmail,
    recurrence: recurrence,
  };
}
