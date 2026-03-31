import { getDeltaBackendAccessToken } from "@/auth/token";
import { backendUrl, getApi } from "@/api/instance";
import { Category, FullDeltaEvent } from "@/types/event";
import { AxiosError } from "axios";
import { notFound } from "next/navigation";

const SHARED_EVENT_LIST_REVALIDATE_SECONDS = 60;

type EventListQuery = {
  categoryIds: number[];
  onlyFuture: boolean;
  onlyPast: boolean;
  onlyMine: boolean;
  onlyJoined: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) {
    throw error;
  }
  console.error("API Error:", error);
  if (error instanceof AxiosError) {
    const status = error.status ?? error.response?.status;
    const message = error.response?.data?.message || "Ukjent feil";

    if (status === 500) {
      throw new ApiError(
        "Kunne ikke hente arrangementer. Vennligst prøv igjen senere.",
        status,
        error.response?.data,
      );
    }

    throw new ApiError(`${message}`, status, error.response?.data);
  }

  throw new ApiError(
    "Kunne ikke koble til serveren. Sjekk internettforbindelsen.",
  );
};

export function validateEventId(eventId: string): void {
  const safeIdPattern = /^[A-Za-z0-9_-]+$/;
  if (!eventId || !safeIdPattern.test(eventId)) {
    throw new ApiError("Invalid event ID", 400);
  }
}

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
    categoryIds: Array.from(
      new Set(categories.map((category) => category.id)),
    ).sort((a, b) => a - b),
    onlyFuture,
    onlyPast,
    onlyMine,
    onlyJoined,
  };
}

function createEventListSearchParams(query: EventListQuery) {
  const params = new URLSearchParams();

  if (query.categoryIds.length > 0) {
    params.set("categories", query.categoryIds.join(","));
  }
  if (query.onlyFuture) params.set("onlyFuture", "true");
  if (query.onlyPast) params.set("onlyPast", "true");
  if (query.onlyJoined) params.set("onlyJoined", "true");
  if (query.onlyMine) params.set("onlyMine", "true");

  return params;
}

async function fetchEventList(
  query: EventListQuery,
  accessToken: string | null,
): Promise<FullDeltaEvent[]> {
  const params = createEventListSearchParams(query);
  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (accessToken !== null) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${backendUrl()}/event${params.size > 0 ? `?${params.toString()}` : ""}`,
    { headers, cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Event list fetch failed with status ${response.status}`);
  }

  return response.json();
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
    return await fetchEventList(query, accessToken);
  } catch (error) {
    console.error("Failed to fetch events:", error);
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

export async function getAllCategories(): Promise<Category[]> {
  try {
    const api = await getApi();
    const response = await api.get<Category[]>("/category");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
