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
