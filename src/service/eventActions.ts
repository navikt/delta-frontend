"use server";

import { getApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  Category,
  ChangeDeltaParticipant,
  CreateDeltaEvent,
  FullDeltaEvent,
} from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";
import { AxiosError } from 'axios';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: unknown): never => {
  console.error('API Error:', error);
  
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Ukjent feil';
    
    if (status === 500) {
      throw new ApiError(
        'Kunne ikke hente arrangementer. Vennligst prøv igjen senere.',
        status,
        error.response?.data
      );
    }

    throw new ApiError(
      `${message}`,
      status,
      error.response?.data
    );
  }
  
  throw new ApiError('Kunne ikke koble til serveren. Sjekk internettforbindelsen.');
};

export async function joinEvent(eventId: string): Promise<void> {
  try {
    const api = await getApi();
    await api.post(`/user/event/${eventId}`);
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 500) {
      console.error('Server error while joining event:', error);
      throw new ApiError('Kunne ikke melde deg på arrangementet. Vennligst prøv igjen senere.');
    }
    throw handleApiError(error);
  }
}

export async function leaveEvent(eventId: string): Promise<void> {
  try {
    const api = await getApi();
    await api.delete(`/user/event/${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    const api = await getApi();
    await api.delete(`/admin/event/${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteParticipant(eventId: string, userEmail: string): Promise<void> {
  try {
    const api = await getApi();
    const payload = { email: userEmail };
    await api.delete(`/admin/event/${eventId}/participant`, { data: payload });
  } catch (error) {
    handleApiError(error);
  }
}

export async function changeParticipant(
  eventId: string,
  changeDeltaParticipant: ChangeDeltaParticipant,
): Promise<void> {
  try {
    const api = await getApi();
    await api.post(`/admin/event/${eventId}/participant`, changeDeltaParticipant);
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

export async function setCategories(eventId: string, categories: number[]): Promise<void> {
  try {
    const api = await getApi();
    await api.post<string>(
      `/admin/event/${eventId}/category`,
      categories,
    );
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const api = await getApi();
    const response = await api.get<Category[]>("/category");
    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getEvents({
  categories = [],
  onlyFuture = false,
  onlyPast = false,
  onlyMine = false,
  onlyJoined = false,
}: {
  categories?: Category[];
  onlyFuture?: boolean;
  onlyPast?: boolean;
  onlyMine?: boolean;
  onlyJoined?: boolean;
}): Promise<FullDeltaEvent[]> {
  try {
    const api = await getApi();
    const response = await api.get<FullDeltaEvent[]>("/event", {
      params: {
        categories: categories.length
          ? categories.map((c) => c.id).join(",")
          : undefined,
        onlyFuture,
        onlyPast,
        onlyJoined,
        onlyMine,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Always return empty array instead of throwing
    return [];
  }
}

export async function getEvent(id: string): Promise<FullDeltaEvent> {
  try {
    const api = await getApi();
    const response = await api.get<FullDeltaEvent>(`/event/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createEvent(
  formData: CreateEventSchema,
): Promise<FullDeltaEvent> {
  try {
    const api = await getApi();

    const createEvent = createDeltaEventFromFormData(formData);
    const response = await api.put("/admin/event", createEvent);

    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string,
): Promise<FullDeltaEvent> {
  try {
    validateEventId(eventId);
    const api = await getApi();

    const createEvent = createDeltaEventFromFormData(formData);
    const response = await api.post(`/admin/event/${eventId}`, createEvent);

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
    sendNotificationEmail: sendNotificationEmail,
  };
}

function validateEventId(eventId: string): void {
  // Allow only safe identifier characters (alphanumeric, dash, underscore).
  // Adjust this regex if event IDs follow a stricter format (e.g., UUID).
  const safeIdPattern = /^[A-Za-z0-9_-]+$/;
  if (!eventId || !safeIdPattern.test(eventId)) {
    throw new ApiError("Invalid event ID", 400);
  }
}
