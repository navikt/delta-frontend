import type { Category, FullDeltaEvent } from "@/types/event";

type EventListFilters = {
  categories: Category[];
  onlyFuture: boolean;
  onlyPast: boolean;
  onlyMine: boolean;
  onlyJoined: boolean;
};

type EventListQuery =
  | { onlyJoined: true }
  | Omit<EventListFilters, "onlyJoined">;

export function categoryNameCandidates(id: string) {
  let decoded = id;
  try { decoded = decodeURIComponent(id); } catch { /* malformed legacy link */ }
  return [...new Set([id, decoded, id.replace(/\+/g, " "), decoded.replace(/\+/g, " ")])];
}

export function getFixedCategoryQuery(category: Category) {
  return { categories: [category], onlyFuture: true };
}

export function getFestivalEventQuery(category: Category | undefined, joined: boolean) {
  return { categories: category ? [category] : [], onlyFuture: true, onlyJoined: joined };
}

export function filterHomeOverview(
  events: FullDeltaEvent[],
  state: { tab: string; onlyRegistered: boolean },
) {
  if (state.onlyRegistered || state.tab === "mine") return events;
  return events.filter(item => !item.categories.some(category => category.name.toLowerCase() === "ips"));
}

export function getHomeEventQuery(
  state: { tab: string; categories: string[]; showPast: boolean; onlyRegistered: boolean },
  catalog: Category[],
) {
  return getEventListQuery({
    categories: state.tab === "alle"
      ? catalog.filter(category => state.categories.includes(category.name)) : [],
    onlyFuture: state.tab === "alle" || !state.showPast,
    onlyPast: state.tab === "mine" && state.showPast,
    onlyMine: state.tab === "mine",
    onlyJoined: state.onlyRegistered,
  });
}

export function eventDatasetKey(
  policy: string,
  query: { categories?: Category[]; onlyFuture?: boolean; onlyPast?: boolean; onlyMine?: boolean; onlyJoined?: boolean },
) {
  return JSON.stringify([
    policy,
    [...new Set((query.categories ?? []).map(category => category.id))].sort((a, b) => a - b),
    query.onlyFuture === true, query.onlyPast === true, query.onlyMine === true, query.onlyJoined === true,
  ]);
}

export function getEventListQuery({
  categories,
  onlyFuture,
  onlyPast,
  onlyMine,
  onlyJoined,
}: EventListFilters): EventListQuery {
  if (onlyJoined) {
    return { onlyJoined: true };
  }

  return { categories, onlyFuture, onlyPast, onlyMine };
}

export function filterActiveJoinedEvents(
  events: FullDeltaEvent[],
  now = Date.now(),
): FullDeltaEvent[] {
  return events.filter(
    (event) => new Date(event.event.endTime).getTime() > now,
  );
}
