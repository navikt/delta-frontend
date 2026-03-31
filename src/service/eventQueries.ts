import { getDeltaBackendAccessToken } from "@/auth/token";
import { backendUrl } from "@/api/instance";
import { Category, FullDeltaEvent } from "@/types/event";
import { AxiosError } from "axios";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

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

async function fetchCachedEventList(
  token: string | null,
  query: EventListQuery,
): Promise<FullDeltaEvent[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");

  const params = createEventListSearchParams(query);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== null) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    `${backendUrl()}/event${params.size > 0 ? `?${params.toString()}` : ""}`,
    { headers },
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
    const token = await getDeltaBackendAccessToken();
    return await fetchCachedEventList(token, query);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

async function fetchCachedEvent(
  token: string | null,
  id: string,
): Promise<FullDeltaEvent> {
  "use cache";
  cacheLife("minutes");
  cacheTag("events");
  cacheTag(`event-${id}`);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== null) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${backendUrl()}/event/${id}`, { headers });

  if (response.status === 404) notFound();
  if (!response.ok) {
    throw new ApiError(`Failed to fetch event: ${response.status}`, response.status);
  }

  return response.json();
}

export async function getEvent(id: string): Promise<FullDeltaEvent> {
  validateEventId(id);
  const token = await getDeltaBackendAccessToken();
  return fetchCachedEvent(token, id);
}

async function fetchCachedCategories(token: string | null): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== null) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${backendUrl()}/category`, { headers });
  if (!response.ok) {
    throw new Error(`Categories fetch failed with status ${response.status}`);
  }

  return response.json();
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const token = await getDeltaBackendAccessToken();
    return await fetchCachedCategories(token);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}
