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

export function findCategoryByName(categories: Category[], id: string) {
  const names = categoryNameCandidates(id);
  const exact = categories.find(category => names.includes(category.name));
  if (exact) return exact;
  const normalized = names.map(name => name.toLocaleLowerCase("nb-NO"));
  return categories.find(category => normalized.includes(category.name.toLocaleLowerCase("nb-NO")));
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
  return events.filter(item => !item.categories.some(category => ["ips", "markedsuka", "utdeling"].includes(category.name.toLowerCase())));
}

// The backend ANDs category filters, so selecting categories only narrows the already-loaded list.
export function filterHomeCategories(
  events: FullDeltaEvent[],
  state: { tab: string; categories: string[]; onlyRegistered: boolean },
  catalog: Category[],
) {
  if (state.onlyRegistered || state.tab !== "alle") return events;
  const selected = catalog.filter(category => state.categories.includes(category.name));
  if (!selected.length) return events;
  return events.filter(item => selected.every(category => item.categories.some(c => c.id === category.id)));
}

export function getHomeEventQuery(
  state: { tab: string; categories: string[]; showPast: boolean; onlyRegistered: boolean },
  _catalog: Category[],
  categoryScope?: Category,
) {
  if (state.onlyRegistered) {
    return { onlyJoined: true, ...(!state.showPast ? { onlyFuture: true } : {}),
      ...(categoryScope ? { categories: [categoryScope] } : {}) };
  }
  return getEventListQuery({
    categories: categoryScope ? [categoryScope] : [],
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

// The waitlist tab reads a different endpoint, so it gets its own dataset policy and always navigates.
export function homeDatasetKey(
  state: { tab: string; categories: string[]; showPast: boolean; onlyRegistered: boolean },
  catalog: Category[],
  categoryScope?: Category,
) {
  if (!state.onlyRegistered && state.tab === "ventelister") {
    return eventDatasetKey("waitlists", { categories: categoryScope ? [categoryScope] : [] });
  }
  return eventDatasetKey(categoryScope ? "category-home" : "home", getHomeEventQuery(state, catalog, categoryScope));
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

export function filterPastJoinedEvents(
  events: FullDeltaEvent[],
  now = Date.now(),
  year: number | null = null,
): FullDeltaEvent[] {
  return getEventHistory(events, now, year).events;
}

export function getEventHistory(
  events: FullDeltaEvent[],
  now: number,
  year: number | null = null,
) {
  const currentYear = new Date(now).getFullYear();
  const selectedYear = year ?? currentYear;
  const past = events.filter(({ event }) => new Date(event.endTime).getTime() <= now);
  const counts = new Map<number, number>();
  for (const { event } of past) {
    const eventYear = new Date(event.startTime).getFullYear();
    if (Number.isFinite(eventYear)) counts.set(eventYear, (counts.get(eventYear) ?? 0) + 1);
  }
  const years = [...new Set([
    ...Array.from({ length: Math.max(1, currentYear - 2023 + 1) }, (_, index) => currentYear - index),
    ...counts.keys(),
  ])].sort((a, b) => b - a).map(value => ({ year: value, count: counts.get(value) ?? 0 }));
  return {
    currentYear,
    year: selectedYear,
    years,
    events: past.filter(({ event }) => new Date(event.startTime).getFullYear() === selectedYear),
  };
}
