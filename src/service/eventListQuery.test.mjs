import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import {
  filterActiveJoinedEvents,
  getEventListQuery,
  getHomeEventQuery,
  eventDatasetKey,
  filterHomeOverview,
  getFixedCategoryQuery,
  getFestivalEventQuery,
  categoryNameCandidates,
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

test("home resolves known category names, ignores legacy time and uses mine history only for mine", () => {
  const categories = [{ id: 4, name: "sosialt" }, { id: 8, name: "blå" }];
  const state = { tab: "alle", categories: ["unknown", "blå", "sosialt"], showPast: true, onlyRegistered: false, time: "past" };
  assert.deepEqual(getHomeEventQuery(state, categories), {
    categories, onlyFuture: true, onlyPast: false, onlyMine: false,
  });
  assert.deepEqual(getHomeEventQuery({ ...state, tab: "mine" }, categories), {
    categories: [], onlyFuture: false, onlyPast: true, onlyMine: true,
  });
  assert.deepEqual(getHomeEventQuery({ ...state, onlyRegistered: true }, categories), { onlyJoined: true });
  assert.deepEqual(getFixedCategoryQuery(categories[1]), { categories: [categories[1]], onlyFuture: true });
});

test("effective dataset identity excludes shallow and ineffective filters, but includes route policy", () => {
  const catalog = [{ id: 4, name: "sosialt" }];
  const state = { tab: "alle", categories: ["sosialt"], showPast: false, onlyRegistered: false };
  const key = eventDatasetKey("home", getHomeEventQuery(state, catalog));
  assert.equal(eventDatasetKey("home", getHomeEventQuery({
    ...state, search: "local", categories: ["sosialt", "sosialt", "unknown"], showPast: true, time: "past",
  }, catalog)), key);
  assert.notEqual(eventDatasetKey("category", getHomeEventQuery(state, catalog)), key);
  assert.notEqual(eventDatasetKey("home", getHomeEventQuery({ ...state, tab: "mine" }, catalog)), key);
  assert.equal(eventDatasetKey("joined", { onlyJoined: true }),
    eventDatasetKey("joined", { categories: [], onlyJoined: true, onlyMine: false }));
});

test("server home policy hides IPS only in normal alle and retains raw joined events for the browser", () => {
  const events = [
    { event: { id: "ips", endTime: "2026-10-14T12:00:00Z" }, categories: [{ name: "IPS" }] },
    { event: { id: "ordinary", endTime: "2026-10-14T10:00:00Z" }, categories: [] },
  ];
  const now = Date.parse("2026-10-14T10:00:00Z");
  assert.deepEqual(filterHomeOverview(events, { tab: "alle", onlyRegistered: false }), [events[1]]);
  assert.deepEqual(filterHomeOverview(events, { tab: "mine", onlyRegistered: false }), events);
  assert.deepEqual(filterHomeOverview(events, { tab: "alle", onlyRegistered: true }), events);
  assert.deepEqual(filterActiveJoinedEvents(events, now), [events[0]]);
});

test("festival public and joined reads keep the fixed category and future flag without home's override", () => {
  const category = { id: 12, name: "mim" };
  assert.deepEqual(getFestivalEventQuery(category, false), {
    categories: [category], onlyFuture: true, onlyJoined: false,
  });

  assert.deepEqual(getFestivalEventQuery(category, true), {
    categories: [category], onlyFuture: true, onlyJoined: true,
  });
});

test("fixed category lookup keeps encoded and plus/space legacy name candidates", () => {
  assert.deepEqual(categoryNameCandidates("statistikkens+dag"), ["statistikkens+dag", "statistikkens dag"]);
  assert.deepEqual(categoryNameCandidates("bl%C3%A5%20dag"), ["bl%C3%A5%20dag", "blå dag"]);
  assert.deepEqual(categoryNameCandidates("bad%link"), ["bad%link"]);
});

test("joined LocalDateTime visibility retains each caller's local timezone interpretation", () => {
  const moduleUrl = new URL("./eventListQuery.ts", import.meta.url).href;
  const script = `
    import { filterActiveJoinedEvents } from ${JSON.stringify(moduleUrl)};
    const events = [{ event: { id: "local-9am", endTime: "2026-10-14T09:00:00" } }];
    process.stdout.write(JSON.stringify(
      filterActiveJoinedEvents(events, Date.parse("2026-10-14T08:00:00Z")).map(item => item.event.id)
    ));
  `;
  const runInZone = zone => {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      env: { ...process.env, TZ: zone }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  assert.deepEqual(runInZone("Asia/Tokyo"), []);
  assert.deepEqual(runInZone("America/Los_Angeles"), ["local-9am"]);
});
