import "server-only";
import { getAllCategories, getEvents } from "./eventQueries";
import { findCategoryByName, filterHomeOverview, getHomeEventQuery } from "./eventListQuery";
import type { Category } from "@/types/event";
import type { HomeState } from "./overviewState";

export async function loadOverview(state: HomeState, categories: Category[], categoryScope?: Category, returnTo = "/") {
  const events = await getEvents(getHomeEventQuery(state, categories, categoryScope), returnTo);
  return categoryScope ? events.filter(item => item.categories.some(category => category.id === categoryScope.id))
    : filterHomeOverview(events, state);
}

export async function resolveFixedCategory(id: string, returnTo: string) {
  const categories = await getAllCategories(returnTo);
  const match = findCategoryByName(categories, id);
  if (match) return match;
  const events = await getEvents({ onlyFuture: true }, returnTo);
  return findCategoryByName(events.flatMap(item => item.categories), id);
}
