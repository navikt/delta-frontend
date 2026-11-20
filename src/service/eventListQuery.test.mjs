import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import {
  filterActiveJoinedEvents,
  filterPastJoinedEvents,
  getEventHistory,
  getEventListQuery,
  getHomeEventQuery,
  filterHomeCategories,
  eventDatasetKey,
  filterHomeOverview,
  getFixedCategoryQuery,
  getFestivalEventQuery,
  categoryNameCandidates,
  homeDatasetKey,
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

test("joined history includes only finished events starting in the current year", () => {
  const now = new Date("2026-10-12T10:00:00.000Z").getTime();
  const events = [
    { event: { startTime: "2026-01-01T10:00:00Z", endTime: "2026-01-01T11:00:00Z" } },
    { event: { startTime: "2026-10-12T09:00:00Z", endTime: "2026-10-12T10:00:00Z" } },
    { event: { startTime: "2026-10-12T09:00:00Z", endTime: "2026-10-12T11:00:00Z" } },
    { event: { startTime: "2026-10-13T09:00:00Z", endTime: "2026-10-13T11:00:00Z" } },
    { event: { startTime: "2025-12-31T10:00:00Z", endTime: "2026-01-01T01:00:00Z" } },
    { event: { startTime: "2025-10-12T09:00:00Z", endTime: "2025-10-12T11:00:00Z" } },
  ];
  assert.deepEqual(filterPastJoinedEvents(events, now), events.slice(0, 2));
  assert.deepEqual(filterActiveJoinedEvents(events, now), events.slice(2, 4));
});

test("joined and host history navigate, while history years stay on the loaded dataset", () => {
  const state = { tab: "alle", categories: [], showPast: false, onlyRegistered: true };
  assert.notEqual(homeDatasetKey({ ...state, showPast: true }, []), homeDatasetKey(state, []));
  const hosted = { ...state, tab: "mine", onlyRegistered: false };
  assert.notEqual(homeDatasetKey({ ...hosted, showPast: true }, []), homeDatasetKey(hosted, []));
  for (const history of [{ ...state, showPast: true }, { ...hosted, showPast: true }]) {
    assert.equal(homeDatasetKey({ ...history, year: 2025 }, []), homeDatasetKey({ ...history, year: 2024 }, []));
  }
});

test("home loads upcoming joined events until history is explicitly requested, regardless of legacy tab", () => {
  const state = { tab: "alle", categories: ["sosialt"], showPast: false, onlyRegistered: true };
  for (const tab of ["alle", "mine", "ventelister"]) {
    assert.deepEqual(getHomeEventQuery({ ...state, tab }, []), { onlyJoined: true, onlyFuture: true });
    assert.deepEqual(getHomeEventQuery({ ...state, tab, showPast: true }, []), { onlyJoined: true });
  }
});

test("history selects a year while counting every finished year, including older loaded history", () => {
  const now = Date.parse("2026-10-12T10:00:00Z");
  const events = [
    { event: { startTime: "2026-10-12T09:00:00Z", endTime: "2026-10-12T10:00:00Z" } },
    { event: { startTime: "2025-12-31T09:00:00Z", endTime: "2026-01-01T10:00:00Z" } },
    { event: { startTime: "2025-06-01T09:00:00Z", endTime: "2025-06-01T10:00:00Z" } },
    { event: { startTime: "2022-06-01T09:00:00Z", endTime: "2022-06-01T10:00:00Z" } },
    { event: { startTime: "2026-10-12T09:00:00Z", endTime: "2026-10-12T11:00:00Z" } },
  ];
  const history = getEventHistory(events, now, 2025);
  assert.deepEqual(history.events, events.slice(1, 3));
  assert.deepEqual(history.years, [
    { year: 2026, count: 1 }, { year: 2025, count: 2 },
    { year: 2024, count: 0 }, { year: 2023, count: 0 }, { year: 2022, count: 1 },
  ]);
  assert.deepEqual(getEventHistory(events, now).events, [events[0]]);
  assert.deepEqual(getEventHistory(events, now, 2021).events, []);
  assert.deepEqual(getEventHistory([], now, 2025).years, [
    { year: 2026, count: 0 }, { year: 2025, count: 0 }, { year: 2024, count: 0 }, { year: 2023, count: 0 },
  ]);
});

test("home resolves known category names, ignores legacy time and uses mine history only for mine", () => {
  const categories = [{ id: 4, name: "sosialt" }, { id: 8, name: "blå" }];
  const state = { tab: "alle", categories: ["unknown", "blå", "sosialt"], showPast: true, onlyRegistered: false, time: "past" };
  assert.deepEqual(getHomeEventQuery(state, categories), {
    categories: [], onlyFuture: true, onlyPast: false, onlyMine: false,
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

test("home hides Markedsuka regardless of casing or other tags but preserves mine and joined events", () => {
  const events = [
    { event: { id: "markedsuka" }, categories: [{ name: "markedsuka" }] },
    { event: { id: "mixed" }, categories: [{ name: "kompetanse" }, { name: "Markedsuka" }] },
    { event: { id: "ordinary" }, categories: [{ name: "kompetanse" }] },
    { event: { id: "untagged" }, categories: [] },
  ];
  assert.deepEqual(filterHomeOverview(events, { tab: "alle", onlyRegistered: false }), events.slice(2));
  assert.deepEqual(filterHomeOverview(events, { tab: "mine", onlyRegistered: false }), events);
  assert.deepEqual(filterHomeOverview(events, { tab: "alle", onlyRegistered: true }), events);
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

test("joined history uses the browser-local year and end time around New Year", () => {
  const moduleUrl = new URL("./eventListQuery.ts", import.meta.url).href;
  const script = `
    import { filterPastJoinedEvents } from ${JSON.stringify(moduleUrl)};
    const events = [
      { event: { id: "last-year", startTime: "2025-12-31T09:00:00", endTime: "2025-12-31T10:00:00" } },
      { event: { id: "this-year", startTime: "2026-01-01T00:00:00", endTime: "2026-01-01T01:00:00" } },
    ];
    process.stdout.write(JSON.stringify(
      filterPastJoinedEvents(events, Date.parse("2026-01-01T00:00:00Z")).map(item => item.event.id)
    ));
  `;
  const runInZone = zone => {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      env: { ...process.env, TZ: zone }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  assert.deepEqual(runInZone("Asia/Tokyo"), ["this-year"]);
  assert.deepEqual(runInZone("America/Los_Angeles"), ["last-year"]);
});

test("category selection filters the loaded list with the backend's AND semantics", () => {
  const catalog = [{ id: 4, name: "sosialt" }, { id: 8, name: "blå" }];
  const events = [
    { event: { id: "a" }, categories: [catalog[0]] },
    { event: { id: "b" }, categories: catalog },
    { event: { id: "c" }, categories: [] },
  ];
  const state = { tab: "alle", categories: ["sosialt"], onlyRegistered: false };
  const ids = (s) => filterHomeCategories(events, s, catalog).map(e => e.event.id);
  assert.deepEqual(ids(state), ["a", "b"]);
  assert.deepEqual(ids({ ...state, categories: ["sosialt", "blå"] }), ["b"]);
  assert.deepEqual(ids({ ...state, categories: ["unknown"] }), ["a", "b", "c"]);
  assert.deepEqual(ids({ ...state, tab: "mine" }), ["a", "b", "c"]);
  assert.deepEqual(ids({ ...state, onlyRegistered: true }), ["a", "b", "c"]);
  const key = (categories) => eventDatasetKey("home", getHomeEventQuery({ ...state, showPast: false, categories }, catalog));
  assert.equal(key(["sosialt"]), key(["sosialt", "blå"]));
});

test("the waitlist tab has its own dataset identity, but Påmeldt wins over a legacy tab", () => {
  const state = { tab: "alle", categories: [], showPast: false, onlyRegistered: false };
  const waitlists = homeDatasetKey({ ...state, tab: "ventelister" }, []);
  assert.equal(homeDatasetKey(state, []), eventDatasetKey("home", getHomeEventQuery(state, [])));
  assert.notEqual(waitlists, homeDatasetKey(state, []));
  assert.notEqual(waitlists, homeDatasetKey({ ...state, tab: "mine" }, []));
  assert.notEqual(waitlists, homeDatasetKey({ ...state, onlyRegistered: true }, []));
  assert.equal(homeDatasetKey({ ...state, tab: "ventelister", onlyRegistered: true }, []),
    homeDatasetKey({ ...state, onlyRegistered: true }, []));
});
