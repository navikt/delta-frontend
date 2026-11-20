import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { createSerializer } from "nuqs/server";
import { calculateEventStatistics, calculateEventStatisticsByYear } from "./eventStatistics.ts";
import { loadStatisticsState, statisticsYearParser } from "./statisticsState.ts";

const user = { firstName: "Test", lastName: "Bruker", email: "fixture@localhost" };
const returningHost = { name: "Tidligere arrangør", email: "returning@localhost" };
const newHost = { name: "Ny arrangør", email: "new@localhost" };
const participant = { name: "Deltaker", email: user.email };
const other = { name: "Annen deltaker", email: "other@localhost" };
const event = (id, year, participants, hosts, isPublic = true) => ({
  event: {
    id, title: isPublic ? id : "Skjult tittel", public: isPublic,
    startTime: `${year}-06-01T10:00:00`, endTime: `${year}-06-01T12:00:00`,
    description: "", location: "", participantLimit: 0,
  },
  participants, hosts, categories: [{ id: 1, name: "kompetanse" }],
});
const events = [
  event("older", 2023, [other], [returningHost]),
  event("previous", 2025, [participant], [returningHost]),
  event("current", 2026, [participant, other], [returningHost, newHost]),
  event("private", 2026, [other], [newHost], false),
];

test("yearly summaries preserve cross-year organiser history, aggregates and private titles", () => {
  const now = new Date("2026-07-01T12:00:00Z");
  const summaries = calculateEventStatisticsByYear(events, [2024, 2025, 2026], now);
  const previous = summaries[2025];
  const current = summaries[2026];
  assert.equal(previous.totalEvents, 4);
  assert.equal(previous.totalEventsThisYear, 1);
  assert.equal(previous.newOrganizersCount, 0);
  assert.equal(current.totalEventsThisYear, 2);
  assert.equal(current.totalParticipants, 3);
  assert.equal(current.uniqueParticipants, 2);
  assert.equal(current.medianParticipants, 1.5);
  assert.equal(current.averageEventsPerPerson, 1.5);
  assert.equal(current.newOrganizersCount, 1);
  assert.equal(current.totalOrganizersCount, 2);
  assert.equal(current.categoryStats[0].uniqueParticipants, 2);
  assert.deepEqual(current.topOrganizersByEvents[0], { name: newHost.name, count: 2 });
  assert.equal(current.allEventsThisYear.find(item => item.id === "private").title, "Privat arrangement");
  assert.equal(current.mostPopularEvents[1].id, "");
  const serialized = JSON.stringify([previous, current]);
  for (const hidden of ["Skjult tittel", ...events.flatMap(item =>
    [...item.participants, ...item.hosts].map(person => person.email))]) {
    assert.equal(serialized.includes(hidden), false);
  }
  const empty = summaries[2024];
  assert.equal(empty.totalEventsThisYear, 0);
  assert.equal(empty.totalParticipants, 0);
  assert.equal(empty.newOrganizersCount, 0);
  assert.deepEqual(empty.allEventsThisYear, []);
});

test("batch summaries preserve category membership, duplicate categories and unsorted host history", () => {
  const categorized = event("categories", 2026, [participant, other], [newHost], false);
  categorized.categories = [
    { id: 1, name: " Kompetanse " },
    { id: 2, name: " FYSISK " },
    { id: 3, name: "fysisk" },
    { id: 4, name: "Fagtorsdag" },
  ];
  const dataset = [
    categorized,
    event("future", 2027, [], [newHost, returningHost]),
    event("earlier", 2023, [], [returningHost]),
    event("invalid-date", "invalid", [participant], [newHost]),
  ];
  const now = new Date("2026-07-01T12:00:00Z");
  const summaries = calculateEventStatisticsByYear(dataset, [2027, 2026, 2024], now);
  const stats = summaries[2026];
  assert.equal(stats.totalEvents, 4);
  assert.equal(stats.totalEventsThisYear, 1);
  assert.equal(stats.newOrganizersCount, 1);
  assert.equal(summaries[2027].newOrganizersCount, 0);
  assert.equal(summaries[2024].totalEventsThisYear, 0);
  assert.deepEqual(stats.attendanceTypeStats.map(({ type, count, totalParticipants, uniqueParticipants }) =>
    ({ type, count, totalParticipants, uniqueParticipants })), [
    { type: "Fysisk", count: 2, totalParticipants: 4, uniqueParticipants: 2 },
    { type: "Digitalt", count: 0, totalParticipants: 0, uniqueParticipants: 0 },
    { type: "Hybrid", count: 0, totalParticipants: 0, uniqueParticipants: 0 },
  ]);
  assert.deepEqual(stats.attendanceTypeStats[0].events, [
    stats.allEventsThisYear[0], stats.allEventsThisYear[0],
  ]);
  assert.deepEqual(stats.arrangementTypeStats[0], {
    type: "Fagtorsdag", count: 1, totalParticipants: 2, uniqueParticipants: 2,
    events: [{ id: "categories", title: "Privat arrangement", startTime: "2026-06-01T10:00:00",
      participants: 2, isPublic: false }],
  });
  for (const year of [2024, 2026, 2027]) {
    assert.deepEqual(summaries[year], calculateEventStatistics(dataset, year, now));
  }
});

test("production RSC payload sends shared event details once across category views", () => {
  const fixture = event("wire-fixture", 2026, [participant], [newHost]);
  fixture.categories = [
    { id: 1, name: "kompetanse" },
    { id: 2, name: "fysisk" },
    { id: 3, name: "fagtorsdag" },
  ];
  const output = execFileSync(process.execPath, [
    "--conditions=react-server", "--input-type=module", "-e", `
      import { createRequire } from "node:module";
      import { calculateEventStatisticsByYear } from ${JSON.stringify(new URL("./eventStatistics.ts", import.meta.url).href)};
      const require = createRequire(${JSON.stringify(import.meta.url)});
      const { renderToReadableStream } = require("next/dist/compiled/react-server-dom-webpack/server.node");
      const statsByYear = calculateEventStatisticsByYear(${JSON.stringify([fixture])}, [2026]);
      const stream = await renderToReadableStream({ statsByYear }, {});
      for await (const chunk of stream) process.stdout.write(chunk);
    `,
  ], { encoding: "utf8", env: { ...process.env, NODE_ENV: "production" }, stdio: ["pipe", "pipe", "pipe"] });
  assert.equal(output.match(/"id":"wire-fixture"/g)?.length, 2,
    "only the shared event details and the distinct most-popular-event summary should be serialized");
});

test("statistics loads one dataset for all years and Oppsummering reads only joined events", async (t) => {
  const moduleUrl = source => `data:text/javascript,${encodeURIComponent(source)}`;
  const readsUrl = moduleUrl(`
    export const calls = [];
    export async function getEvents(query) {
      calls.push(query);
      const events = ${JSON.stringify(events)};
      return query.onlyJoined ? events.filter(item =>
        item.participants.some(person => person.email === ${JSON.stringify(user.email)})) : events;
    }
  `);
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      const parent = context.parentURL ?? "";
      const target = parent.endsWith("/statsActions.ts") || parent.endsWith("/wrappedActions.ts");
      if (target) {
        const stub = specifier === "server-only" ? "export {};"
          : specifier === "@/auth/token" ? `export const getUser = async () => (${JSON.stringify(user)});`
          : specifier === "next/navigation" ? "export function unstable_rethrow(error) { throw error; }"
          : null;
        if (stub !== null) return { url: moduleUrl(stub), shortCircuit: true };
        if (specifier === "./eventQueries.ts" || specifier === "./eventQueries") {
          return { url: readsUrl, shortCircuit: true };
        }
      }
      return nextResolve(specifier, context);
    },
  });
  t.after(() => hooks.deregister());
  const { getEventStatistics } = await import("./statsActions.ts");
  const { getUserWrappedStats } = await import("./wrappedActions.ts");
  const { calls } = await import(readsUrl);
  const summaries = await getEventStatistics([2024, 2025, 2026]);
  assert.deepEqual(calls, [{}]);
  assert.deepEqual(Object.keys(summaries), ["2024", "2025", "2026"]);
  assert.equal(summaries[2026].totalParticipants, 3);
  calls.length = 0;
  const wrapped = await getUserWrappedStats(2026);
  assert.deepEqual(calls, [{ onlyJoined: true }]);
  assert.equal(wrapped.totalEventsAttended, 1);
  assert.equal(wrapped.totalPeopleMetWith, 3);
  assert.equal(wrapped.favoriteCategory.name, "Kompetanse");
  assert.equal("percentileRank" in wrapped, false);
});

test("statistics year URL state keeps deep links and unrelated parameters", () => {
  assert.equal(loadStatisticsState("?year=2023").year, 2023);
  assert.equal(loadStatisticsState("?year=invalid").year, null);
  assert.equal(loadStatisticsState("?year=9999").year, null);
  const serialize = createSerializer({ year: statisticsYearParser.withDefault(2026) });
  assert.equal(serialize("?year=2025&extra=keep", { year: 2024 }), "?year=2024&extra=keep");
  assert.equal(serialize("?year=2025&extra=keep", { year: 2026 }), "?extra=keep");
});
