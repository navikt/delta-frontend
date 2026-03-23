"use server";

import { getDeltaBackendAccessToken } from "@/auth/token";
import { backendUrl, getApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  Category,
  ChangeDeltaParticipant,
  CreateDeltaEvent,
  FullDeltaEvent,
  RecurrenceFrequency,
  EventEditScope,
} from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";
import { AxiosError } from 'axios';
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";

const SHARED_EVENT_LIST_REVALIDATE_SECONDS = 60;

type EventListQuery = {
  categoryIds: number[];
  onlyFuture: boolean;
  onlyPast: boolean;
  onlyMine: boolean;
  onlyJoined: boolean;
};

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
  if (error instanceof ApiError) {
    throw error;
  }
  console.error('API Error:', error);
  if (error instanceof AxiosError) {
    const status = error.status ?? error.response?.status;
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

function normalizeEventListQuery({
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
}): EventListQuery {
  return {
    categoryIds: Array.from(new Set(categories.map((category) => category.id))).sort((a, b) => a - b),
    onlyFuture,
    onlyPast,
    onlyMine,
    onlyJoined,
  };
}

function isSharedEventListQuery(query: EventListQuery) {
  return !query.onlyJoined && !query.onlyMine;
}

function createEventListSearchParams(query: EventListQuery) {
  const params = new URLSearchParams();

  if (query.categoryIds.length > 0) {
    params.set("categories", query.categoryIds.join(","));
  }

  if (query.onlyFuture) {
    params.set("onlyFuture", "true");
  }

  if (query.onlyPast) {
    params.set("onlyPast", "true");
  }

  if (query.onlyJoined) {
    params.set("onlyJoined", "true");
  }

  if (query.onlyMine) {
    params.set("onlyMine", "true");
  }

  return params;
}

function createSharedEventListCacheKey(query: EventListQuery) {
  return [
    query.categoryIds.join(","),
    query.onlyFuture ? "future" : "all",
    query.onlyPast ? "past" : "not-past",
  ].join("|");
}

async function fetchEventList(query: EventListQuery, accessToken: string | null): Promise<FullDeltaEvent[]> {
  const params = createEventListSearchParams(query);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${backendUrl()}/event${params.size > 0 ? `?${params.toString()}` : ""}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Event list fetch failed with status ${response.status}`);
  }

  return response.json();
}

async function getSharedEventList(query: EventListQuery, accessToken: string | null) {
  const cacheKey = createSharedEventListCacheKey(query);

  return unstable_cache(
    async () => fetchEventList(query, accessToken),
    ["shared-event-list", cacheKey],
    { revalidate: SHARED_EVENT_LIST_REVALIDATE_SECONDS },
  )();
}

function canUseSharedEventListCache(query: EventListQuery, accessToken: string | null) {
  return isSharedEventListQuery(query) && accessToken === null;
}

export async function joinEvent(eventId: string): Promise<void> {
  try {
    validateEventId(eventId);
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
    validateEventId(eventId);
    const api = await getApi();
    await api.delete(`/user/event/${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.delete(`/admin/event/${eventId}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteParticipant(eventId: string, userEmail: string): Promise<void> {
  try {
    validateEventId(eventId);
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
    validateEventId(eventId);
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
    validateEventId(eventId);
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
    const query = normalizeEventListQuery({
      categories,
      onlyFuture,
      onlyPast,
      onlyJoined,
      onlyMine,
    });
    const accessToken = await getDeltaBackendAccessToken();

    if (canUseSharedEventListCache(query, accessToken)) {
      return await getSharedEventList(query, accessToken);
    }

    return await fetchEventList(query, accessToken);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    // Always return empty array instead of throwing
    return [];
  }
}

export async function getEvent(id: string): Promise<FullDeltaEvent> {
  try {
    validateEventId(id);
    const api = await getApi();
    const response = await api.get<FullDeltaEvent>(`/event/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.status === 404) {
      notFound();
    }
    throw handleApiError(error);
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

  const recurrence =
    formData.recurrenceFrequency && formData.recurrenceUntilDate
      ? {
          frequency: formData.recurrenceFrequency as RecurrenceFrequency,
          untilDate: formatInTimeZone(
            formData.recurrenceUntilDate,
            "Europe/Oslo",
            "yyyy-MM-dd",
          ),
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
    signupDeadline: formData.hasSignupDeadline ? deadline : undefined,
    sendNotificationEmail: sendNotificationEmail,
    recurrence,
    editScope: formData.editScope as EventEditScope | undefined,
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
