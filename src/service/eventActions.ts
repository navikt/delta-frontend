"use server";

import { getApi } from "@/api/instance";
import type { CreateEventSchema } from "@/components/createEventForm";
import {
  Category,
  ChangeDeltaParticipant,
  CreateDeltaEvent,
  EditScope,
  FullDeltaEvent,
  InviteeRequest,
} from "@/types/event";
import { ActionResult } from "@/types/room";
import { formatInTimeZone } from "date-fns-tz";
import { AxiosError } from 'axios';
import { unstable_rethrow } from "next/navigation";

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
  unstable_rethrow(error);
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
  unstable_rethrow(error);
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
  unstable_rethrow(error);
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
