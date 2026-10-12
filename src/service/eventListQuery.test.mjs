import assert from "node:assert/strict";
import { test } from "node:test";
import {
  filterActiveJoinedEvents,
  getEventListQuery,
} from "./eventListQuery.ts";

test("fetches all joined events without applying the public-list filters", () => {
  assert.deepEqual(
    getEventListQuery({
      categories: [{ id: 4, name: "sosialt" }],
      onlyFuture: true,
      onlyPast: false,
      onlyMine: false,
      onlyJoined: true,
    }),
    { onlyJoined: true },
  );
});

test("preserves the regular event-list filters when not showing joined events", () => {
  const filters = {
    categories: [{ id: 4, name: "sosialt" }],
    onlyFuture: true,
    onlyPast: false,
    onlyMine: false,
    onlyJoined: false,
  };

  assert.deepEqual(getEventListQuery(filters), {
    categories: filters.categories,
    onlyFuture: true,
    onlyPast: false,
    onlyMine: false,
  });
});

test("filters joined events that have already ended", () => {
  const now = new Date("2026-10-12T10:00:00.000Z").getTime();
  const events = [
    { event: { endTime: "2026-10-12T11:00:00.000Z" } },
    { event: { endTime: "2026-10-12T09:59:00.000Z" } },
  ];

  assert.deepEqual(filterActiveJoinedEvents(events, now), [events[0]]);
});
