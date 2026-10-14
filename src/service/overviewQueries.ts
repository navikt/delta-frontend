import "server-only";
import { getAllCategories, getEvents } from "./eventQueries";
import { categoryNameCandidates, filterHomeOverview, getHomeEventQuery } from "./eventListQuery";
import type { Category } from "@/types/event";
import type { HomeState } from "./overviewState";

export async function loadOverview(state: HomeState, categories: Category[]) {
  const events = await getEvents(getHomeEventQuery(state, categories), "/");
  return filterHomeOverview(events, state);
}

export async function resolveFixedCategory(id: string, returnTo: string) {
  const categories = await getAllCategories(returnTo);
  const names = categoryNameCandidates(id);
  const match = categories.find(category => names.includes(category.name));
  if (match) return match;
  const events = await getEvents({ onlyFuture: true }, returnTo);
  return events.flatMap(item => item.categories).find(category => names.includes(category.name));
}
