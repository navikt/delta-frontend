import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { createLoader, createSerializer } from "nuqs/server";
import { resolveFestival, festivalBrowserPlan, filterFestivalEvents, festivalTabNavigation, joinedFestivalEventIds } from "./festivalPolicy.ts";
import { festivalParsers } from "./overviewState.ts";

const config = {
  category: "mim", month: "mai", activeDays: ["20", "21"],
  timeWindowTabs: [{ id: "morning", label: "Morning", startTime: "09:00", endTime: "10:00" }],
};
const snapshot = new Date(2026, 3, 1, 12);
const makeEvent = (id, hour, minute, attendance = "fysisk", participants = []) => ({
  event: { id, title: id, startTime: new Date(2026, 4, 20, hour, minute).toISOString() },
  categories: [{ id: 1, name: "mim" }, { id: 2, name: attendance }],
  participants, hosts: [{ email: "host@fixture" }],
});

test("festival slices keep inclusive windows, attendance, ordering and participant-only badges", () => {
  const festival = resolveFestival(config, snapshot);
  const events = [
    makeEvent("start", 9, 0), makeEvent("end", 10, 0, "fysisk", [{ email: "user@fixture" }]),
    makeEvent("late", 10, 1), makeEvent("online", 9, 30, "digitalt"),
  ];
  assert.deepEqual(filterFestivalEvents(events, festival, {
    tab: "morning", search: "", attendance: "fysisk",
  }).map(item => item.event.id), ["start", "end"]);
  assert.deepEqual(filterFestivalEvents(events, festival, {
    tab: "morning", search: "online", attendance: "digitalt",
  }).map(item => item.event.id), ["online"]);
  assert.deepEqual([...joinedFestivalEventIds(events, "user@fixture")], ["end"]);
  assert.deepEqual([...joinedFestivalEventIds(events, "host@fixture")], []);
});

test("only crossing the public/joined dataset seam navigates, in both directions", () => {
  assert.equal(festivalTabNavigation("morning", "21"), "shallow");
  assert.equal(festivalTabNavigation("morning", "påmeldte"), "server");
  assert.equal(festivalTabNavigation("påmeldte", "morning"), "server");
  assert.equal(festivalTabNavigation("påmeldte", "påmeldte"), "shallow");
});

test("festival defaults and URL parsers use one deterministic snapshot", () => {
  const festival = resolveFestival({ category: "fagfest", month: "April", activeDays: ["28", "29", "30"] },
    new Date(2026, 3, 29, 12));
  assert.equal(festival.defaultTab, "29");
  assert.equal(festival.year, 2026);
  const parsers = festivalParsers(festival.defaultTab, festival.tabs);
  const load = createLoader(parsers);
  assert.equal(load("?tab=joined&view=invalid&attendance=invalid").tab, "29");
  assert.deepEqual(load("?tab=p%C3%A5meldte&view=program&attendance=digitalt"), {
    tab: "påmeldte", view: "program", search: "", attendance: "digitalt",
  });
  assert.equal(new URLSearchParams(createSerializer(parsers)({ tab: "påmeldte" })).get("tab"), "påmeldte");
});

test("joined festival slices retain private registrations outside festival dates and exempt attendance", () => {
  const festival = resolveFestival(config, snapshot);
  const privateJoined = makeEvent("private joined", 9, 0, "digitalt", [{ email: "user@fixture" }]);
  privateJoined.event.public = false;
  privateJoined.event.startTime = new Date(2026, 6, 1, 9).toISOString();
  const unrelated = { ...privateJoined, categories: [{ name: "different festival" }] };
  assert.deepEqual(filterFestivalEvents([privateJoined, unrelated], festival, {
    tab: "påmeldte", search: "private", attendance: "fysisk",
  }), [privateJoined]);
  assert.deepEqual(filterFestivalEvents([privateJoined], festival, {
    tab: "morning", search: "", attendance: "digitalt",
  }), []);
});

test("festival date rollover and combined/time-window defaults keep the existing rules", () => {
  const days = { category: "fagfest", month: "April", activeDays: ["28", "29", "30"] };
  assert.equal(resolveFestival(days, new Date(2026, 2, 1)).defaultTab, "28");
  const past = resolveFestival(days, new Date(2026, 9, 14));
  assert.equal(past.defaultTab, "påmeldte");
  assert.equal(past.year, 2027);
  assert.deepEqual(past.activeDays, ["28", "29", "30"]);
  assert.equal(resolveFestival({ ...days, combineDays: true }, new Date(2026, 9, 14)).defaultTab, "alle");
  assert.equal(resolveFestival(config, new Date(2026, 9, 14)).defaultTab, "morning");
});

test("one request instant preserves browser defaults and corrects only implicit dataset differences", () => {
  const policyUrl = new URL("./festivalPolicy.ts", import.meta.url).href;
  const stateUrl = new URL("./overviewState.ts", import.meta.url).href;
  const runInZone = (zone, script) => {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script], {
      env: { ...process.env, TZ: zone }, encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  const server = runInZone("UTC", `
    import { resolveFestival } from ${JSON.stringify(policyUrl)};
    process.stdout.write(JSON.stringify(resolveFestival(
      { category: "mim", month: "mai", activeDays: ["20", "21"] },
      new Date("2026-05-21T22:30:00Z")
    )));
  `);
  assert.equal(server.defaultTab, "21");
  const inspectBrowser = zone => runInZone(zone, `
    import { festivalBrowserPlan } from ${JSON.stringify(policyUrl)};
    import { festivalParsers } from ${JSON.stringify(stateUrl)};
    import { createSerializer } from "nuqs/server";
    const server = ${JSON.stringify(server)};
    const implicit = festivalBrowserPlan(server, null);
    const corrected = createSerializer(festivalParsers(implicit.festival.defaultTab, implicit.festival.tabs))(
      "?search=latest&unknown=keep", { tab: implicit.festival.defaultTab }
    );
    process.stdout.write(JSON.stringify({
      defaultTab: implicit.festival.defaultTab, correction: implicit.correction, corrected,
      afterCorrection: festivalBrowserPlan(server, implicit.festival.defaultTab).correction,
      explicit: festivalBrowserPlan(server, "21").correction,
      requestInstant: implicit.festival.requestInstant
    }));
  `);
  const oslo = inspectBrowser("Europe/Oslo");
  assert.equal(oslo.defaultTab, "påmeldte");
  assert.deepEqual(oslo.correction, { tab: "påmeldte", navigation: "server" });
  assert.equal(oslo.afterCorrection, null);
  assert.equal(oslo.explicit, null);
  assert.equal(oslo.requestInstant, Date.parse("2026-05-21T22:30:00Z"));
  assert.deepEqual([...new URLSearchParams(oslo.corrected)], [
    ["search", "latest"], ["unknown", "keep"], ["tab", "påmeldte"],
  ]);
  const utc = inspectBrowser("UTC");
  assert.equal(utc.defaultTab, "21");
  assert.equal(utc.correction, null);

  const serverSnapshot = iso => runInZone("UTC", `
    import { resolveFestival } from ${JSON.stringify(policyUrl)};
    process.stdout.write(JSON.stringify(resolveFestival(
      { category: "fagfest", month: "April", activeDays: ["28", "29", "30"] },
      new Date(${JSON.stringify(iso)})
    )));
  `);
  const browserPlan = server => runInZone("America/Los_Angeles", `
    import { festivalBrowserPlan } from ${JSON.stringify(policyUrl)};
    process.stdout.write(JSON.stringify(festivalBrowserPlan(${JSON.stringify(server)}, null)));
  `);
  const shallow = browserPlan(serverSnapshot("2026-04-29T00:30:00Z"));
  assert.deepEqual(shallow.correction, { tab: "28", navigation: "shallow" });
  const leavingJoined = browserPlan(serverSnapshot("2026-05-01T00:30:00Z"));
  assert.deepEqual(leavingJoined.correction, { tab: "30", navigation: "server" });
  assert.equal(leavingJoined.festival.year, 2026);
});
