import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCardTimeRange, groupEventsByDay } from "./eventGrouping.ts";

const item = (id, startTime) => ({ event: { id, startTime } });
// Local-time constructor: Monday 16 November 2026, 09:00 in the runner's timezone.
const now = new Date(2026, 10, 16, 9, 0).getTime();

test("groups by local start day with relative and weekday labels, sorted by start time", () => {
  const groups = groupEventsByDay([
    item("wed", "2026-11-18T10:00:00"),
    item("today-late", "2026-11-16T14:00:00"),
    item("tomorrow", "2026-11-17T08:00:00"),
    item("today-early", "2026-11-16T08:30:00"),
  ], now);
  assert.deepEqual(groups.map(g => [g.key, g.label, g.dateLabel, g.events.map(e => e.event.id)]), [
    ["2026-11-16", "I dag", "mandag 16. november", ["today-early", "today-late"]],
    ["2026-11-17", "I morgen", "tirsdag 17. november", ["tomorrow"]],
    ["2026-11-18", "Onsdag", "18. november", ["wed"]],
  ]);
});

test("adds the year only when it differs from now", () => {
  const [group] = groupEventsByDay([item("next-year", "2027-01-04T10:00:00")], now);
  assert.equal(group.label, "Mandag");
  assert.equal(group.dateLabel, "4. januar 2027");
});

test("descending order puts the most recent past day first", () => {
  const groups = groupEventsByDay([
    item("old", "2026-10-01T10:00:00"),
    item("recent-b", "2026-11-10T12:00:00"),
    item("recent-a", "2026-11-10T09:00:00"),
  ], now, { descending: true });
  assert.deepEqual(groups.map(g => g.key), ["2026-11-10", "2026-10-01"]);
  assert.deepEqual(groups[0].events.map(e => e.event.id), ["recent-a", "recent-b"]);
  assert.deepEqual(groupEventsByDay([], now), []);
});

test("card time ranges omit the date unless the event spans several days", () => {
  assert.equal(formatCardTimeRange({ startTime: "2026-11-16T14:00:00", endTime: "2026-11-16T16:00:00" }), "14:00 – 16:00");
  assert.equal(formatCardTimeRange({ startTime: "2026-11-16T09:00:00", endTime: "2026-11-18T15:30:00" }), "09:00 – 18. nov. 15:30");
  assert.equal(formatCardTimeRange({ startTime: "2026-11-16T00:00:00", endTime: "2026-11-16T00:01:00" }), "Kommer senere");
});
