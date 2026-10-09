"use server";

import { getDeltaBackendAccessToken, getUser } from "@/auth/token";
import { backendUrl, getApi } from "@/api/instance";
import { CreateEventSchema } from "@/components/createEventForm";
import {
  Category,
  ChangeDeltaParticipant,
  CreateDeltaEvent,
  DeltaParticipant,
  DirectoryPerson,
  EditScope,
  FullDeltaEvent,
  InviteeRequest,
} from "@/types/event";
import { ActionResult } from "@/types/room";
import { getInvitationCapacity, InvitationCapacity } from "@/service/eventCapacity";
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
    await api.post(`/user/event/${encodeURIComponent(eventId)}`);
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
    await api.delete(`/user/event/${encodeURIComponent(eventId)}`);
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteEvent(eventId: string, editScope?: EditScope): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    await api.delete(`/admin/event/${encodeURIComponent(eventId)}`, {
      ...(editScope ? { params: { editScope } } : {}),
    });
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteParticipant(eventId: string, userEmail: string): Promise<void> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    const payload = { email: userEmail };
    await api.delete(`/admin/event/${encodeURIComponent(eventId)}/participant`, { data: payload });
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
    await api.post(`/admin/event/${encodeURIComponent(eventId)}/participant`, changeDeltaParticipant);
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
      `/admin/event/${encodeURIComponent(eventId)}/category`,
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
    const response = await api.get<FullDeltaEvent>(`/event/${encodeURIComponent(id)}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.status === 404) {
      notFound();
    }

    throw handleApiError(error);
  }
}

export async function getEventRegistrationState(eventId: string): Promise<{
  participants: DeltaParticipant[];
  invitationCapacity: InvitationCapacity;
}> {
  const [event, user] = await Promise.all([getEvent(eventId), getUser()]);
  return {
    participants: event.participants,
    invitationCapacity: getInvitationCapacity(
      event.participants,
      event.hosts,
      event.invited,
      user.email,
      event.event.signupDeadline,
    ),
  };
}

export async function searchPeople(query: string): Promise<ActionResult<DirectoryPerson[]>> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return { ok: true, data: [] };
  }

  try {
    const api = await getApi();
    const response = await api.get<DirectoryPerson[]>("/directory/search", {
      params: { q: normalizedQuery.slice(0, 100) },
    });
    return { ok: true, data: response.data };
  } catch (error) {
    return toSharedCalendarActionError(error, "Kunne ikke søke etter personer.");
  }
}

export async function invitePeople(
  eventId: string,
  invitees: InviteeRequest[],
): Promise<ActionResult<FullDeltaEvent>> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    const response = await api.post<FullDeltaEvent>(
      `/admin/event/${encodeURIComponent(eventId)}/invitations`,
      invitees,
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return toSharedCalendarActionError(error, "Kunne ikke sende invitasjonene.");
  }
}

export async function revokeInvitation(
  eventId: string,
  email: string,
): Promise<ActionResult<FullDeltaEvent>> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    const response = await api.delete<FullDeltaEvent>(
      `/admin/event/${encodeURIComponent(eventId)}/invitations`,
      { data: { email } },
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return toSharedCalendarActionError(error, "Kunne ikke trekke tilbake invitasjonen.");
  }
}

export async function retryCalendarSync(
  eventId: string,
): Promise<ActionResult<FullDeltaEvent>> {
  try {
    validateEventId(eventId);
    const api = await getApi();
    const response = await api.post<FullDeltaEvent>(
      `/admin/event/${encodeURIComponent(eventId)}/calendar/retry`,
    );
    return { ok: true, data: response.data };
  } catch (error) {
    return toSharedCalendarActionError(error, "Kunne ikke starte synkroniseringen på nytt.");
  }
}

function toSharedCalendarActionError(
  error: unknown,
  fallback: string,
): { ok: false; status?: number; message: string } {
  console.error("Shared calendar API error:", error);
  if (error instanceof AxiosError) {
    const status = error.status;
    const backendMessage = (error as AxiosError & { responseMessage?: string }).responseMessage;
    if (status === 401 || status === 403) {
      return { ok: false, status, message: "Du har ikke tilgang til denne handlingen." };
    }
    if (status === 409) {
      return {
        ok: false,
        status,
        message: backendMessage || "Det er ikke nok ledige plasser til alle som skal inviteres.",
      };
    }
    if (status === 400 || status === 404) {
      return { ok: false, status, message: backendMessage || fallback };
    }
    if (status === 502) {
      return { ok: false, status, message: `${fallback} Microsoft-tjenesten svarer ikke. Prøv igjen.` };
    }
  }
  return { ok: false, message: fallback };
}

export async function createEvent(
  formData: CreateEventSchema,
  invitees?: InviteeRequest[],
): Promise<ActionResult<FullDeltaEvent>> {
  try {
    const api = await getApi();

    const event = createDeltaEventFromFormData(formData, invitees);
    const response = await api.put<FullDeltaEvent>("/admin/event", event);

    return { ok: true, data: response.data };
  } catch (error) {
    return toSaveErrorResult(error);
  }
}

export async function updateEvent(
  formData: CreateEventSchema,
  eventId: string,
  editScope?: EditScope,
  invitees?: InviteeRequest[],
): Promise<ActionResult<FullDeltaEvent>> {
  try {
    validateEventId(eventId);
    const api = await getApi();

    const event = createDeltaEventFromFormData(formData, invitees);
    if (editScope) {
      event.editScope = editScope;
    }
    const response = await api.post<FullDeltaEvent>(`/admin/event/${encodeURIComponent(eventId)}`, event);

    return { ok: true, data: response.data };
  } catch (error) {
    return toSaveErrorResult(error);
  }
}

function toSaveErrorResult(error: unknown): { ok: false; status?: number; message: string } {
  console.error("Failed to save event:", error);
  if (error instanceof ApiError) {
    return { ok: false, status: error.status, message: error.message };
  }
  if (error instanceof AxiosError) {
    const status = error.status;
    const backendMessage = (error as AxiosError & { responseMessage?: string }).responseMessage;
    if (status === 502) {
      return {
        ok: false,
        status,
        message:
          "Kunne ikke booke rommet eller opprette Teams-møtet. Ingenting er lagret – prøv igjen.",
      };
    }
    if (status === 400) {
      return { ok: false, status, message: backendMessage || "Ugyldig forespørsel." };
    }
    if (status === 409) {
      return {
        ok: false,
        status,
        message: backendMessage || "Invitasjonene kan ikke legges til. Kontroller kapasiteten og prøv igjen.",
      };
    }
    if (status === 401 || status === 403) {
      return { ok: false, status, message: "Du har ikke tilgang til å lagre dette arrangementet." };
    }
    return {
      ok: false,
      status,
      message: "Kunne ikke lagre arrangementet. Vennligst prøv igjen senere.",
    };
  }
  return { ok: false, message: "Kunne ikke koble til serveren. Sjekk internettforbindelsen." };
}

/** Local (Europe/Oslo) time in the backend's event time format. */
function formatBackendDateTime(date: Date, time: string): string {
  return `${formatInTimeZone(date, "Europe/Oslo", "yyyy-MM-dd")}T${time}:00Z`;
}

function createDeltaEventFromFormData(
  formData: CreateEventSchema,
  invitees?: InviteeRequest[],
): CreateDeltaEvent {
  const start = formatBackendDateTime(formData.startDate, formData.startTime);
  const end = formatBackendDateTime(formData.endDate, formData.endTime);

  const deadline = formData.signupDeadlineDate
    ? `${formatInTimeZone(
        formData.signupDeadlineDate,
        "Europe/Oslo",
        "yyyy-MM-dd",
      )}T${formData.signupDeadlineTime}:00Z`
    : undefined;

  const sendNotificationEmail = formData.sendNotificationEmail;

  const recurrence =
    formData.isRecurring && formData.recurrenceFrequency && formData.recurrenceUntilDate
      ? {
          frequency: formData.recurrenceFrequency,
          untilDate: formatInTimeZone(
            formData.recurrenceUntilDate,
            "Europe/Oslo",
            "yyyy-MM-dd",
          ),
          ...(formData.hasSignupDeadline && formData.signupDeadlineOffsetDays
            ? { signupDeadlineOffsetDays: parseInt(formData.signupDeadlineOffsetDays) }
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
    signupDeadline: formData.hasSignupDeadline && !formData.isRecurring ? deadline : undefined,
    sendNotificationEmail: sendNotificationEmail,
    recurrence: recurrence,
    ...(invitees?.length ? { invitees } : {}),
    // Room/Teams: the form only sets these when the feature is on and the value should change.
    // Omitted means "keep current" on update. Never sent for recurring events (backend 400).
    ...(!formData.isRecurring && formData.roomEmail && formData.roomName
      ? { roomEmail: formData.roomEmail, roomName: formData.roomName }
      : {}),
    ...(!formData.isRecurring && formData.isOnlineMeeting === true
      ? { isOnlineMeeting: true }
      : {}),
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
