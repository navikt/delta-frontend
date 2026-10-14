import type { Category, FullDeltaEvent } from "@/types/event";

export type EventListInput = {
  categories?: Category[];
  onlyFuture?: boolean;
  onlyPast?: boolean;
  onlyMine?: boolean;
  onlyJoined?: boolean;
};

export class ApiError extends Error {
  status?: number;
  constructor(context: string, status?: number) {
    super(`Kunne ikke hente ${context}. Prøv igjen.`);
    this.name = "ApiError";
    this.status = status;
  }
}

export function normalizeEventListQuery(input: EventListInput) {
  return {
    categoryIds: [...new Set((input.categories ?? []).map(category => category.id))].sort((a, b) => a - b),
    onlyFuture: input.onlyFuture === true,
    onlyPast: input.onlyPast === true,
    onlyMine: input.onlyMine === true,
    onlyJoined: input.onlyJoined === true,
  };
}

export async function fetchEventList(
  baseUrl: string,
  query: Partial<ReturnType<typeof normalizeEventListQuery>>,
  accessToken: string | null,
): Promise<FullDeltaEvent[]> {
  const params = new URLSearchParams();
  if (query.categoryIds?.length) params.set("categories", query.categoryIds.join(","));
  for (const flag of ["onlyFuture", "onlyPast", "onlyMine", "onlyJoined"] as const) {
    if (query[flag]) params.set(flag, "true");
  }
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken !== null) headers.Authorization = `Bearer ${accessToken}`;
  try {
    const response = await fetch(`${baseUrl}/event${params.size ? `?${params}` : ""}`, {
      headers, cache: "no-store",
    });
    if (!response.ok) throw new ApiError("arrangementer", response.status);
    return await response.json();
  } catch (error) {
    const safeError = error instanceof ApiError ? error : new ApiError("arrangementer");
    console.error("Event query failed", { context: "event-list", status: safeError.status });
    throw safeError;
  }
}
