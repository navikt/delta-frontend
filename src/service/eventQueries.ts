import "server-only";
import { cache } from "react";
import { checkToken, getDeltaBackendAccessToken, isDeltaMaintainer } from "@/auth/token";
import { backendUrl, getApi } from "@/api/instance";
import type { Category, FullDeltaEvent } from "@/types/event";
import { AxiosError } from "axios";
import { notFound } from "next/navigation";
import { ApiError, fetchEventList, normalizeEventListQuery, type EventListInput } from "./eventListTransport";

export async function getEvents(input: EventListInput = {}, returnTo?: string): Promise<FullDeltaEvent[]> {
  await checkToken(returnTo);
  const accessToken = await getDeltaBackendAccessToken();
  return fetchEventList(backendUrl(), normalizeEventListQuery(input), accessToken);
}

export const getAllCategories = cache(async (returnTo?: string): Promise<Category[]> => {
  await checkToken(returnTo);
  const api = await getApi();
  try {
    return (await api.get<Category[]>("/category")).data;
  } catch (error) {
    const status = error instanceof AxiosError ? error.status : undefined;
    console.error("Category query failed", { context: "categories", status });
    throw new ApiError("kategorier", status);
  }
});

export const getEvent = cache(async (id: string, returnTo = `/event/${id}`): Promise<FullDeltaEvent> => {
  await checkToken(returnTo);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new ApiError("arrangementet", 400);
  const api = await getApi();
  try {
    return (await api.get<FullDeltaEvent>(`/event/${encodeURIComponent(id)}`)).data;
  } catch (error) {
    const status = error instanceof AxiosError ? error.status : undefined;
    if (status === 404) notFound();
    console.error("Event query failed", { context: "event", status });
    throw new ApiError("arrangementet", status);
  }
});

export async function fetchAllEventsForAdmin(): Promise<FullDeltaEvent[]> {
  await checkToken("/admin");
  if (!(await isDeltaMaintainer())) notFound();
  return getEvents({}, "/admin");
}
