import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { loadBindings, transformSync } from "next/dist/build/swc/index.js";
import * as queries from "../service/eventListQuery.ts";

await loadBindings();

function loadComponent(name, mocks) {
  const url = new URL(name, import.meta.url);
  const filename = fileURLToPath(url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename,
    jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  const require = createRequire(url);
  runInThisContext(`(function(module, exports, require) { ${code}\n})`, { filename })(
    module, module.exports, id => Object.hasOwn(mocks, id) ? { __esModule: true, ...mocks[id] } : require(id),
  );
  return module.exports;
}

const noop = () => null;

function loadOverview(category, calls) {
  return loadComponent("./categoryOverview.tsx", {
    "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); } },
    "@/auth/token": {
      checkToken: async path => { calls.push(["auth", path]); },
      getUser: async () => ({ email: "viewer@example.test" }),
    },
    "@/service/overviewQueries": {
      resolveFixedCategory: async (id, path) => { calls.push(["resolve", id, path]); return category; },
    },
    "@/service/eventQueries": {
      getEvents: async (query, path) => { calls.push(["events", query, path]); return []; },
    },
    "@/service/eventListQuery": queries,
    "./cardWithBackground": { default: noop },
    "./homeOverview": { default: noop },
    "./eventResultsSkeleton": { default: noop, OVERVIEW_RESULTS_ID: "overview-results" },
  }).default;
}

test("short and legacy category routes use the same overview and retain their auth return URL", async () => {
  for (const [file, params, returnTo] of [
    ["../app/[category]/page.tsx", { category: "yoga" }, "/yoga"],
    ["../app/kategori/[id]/page.tsx", { id: "yoga" }, "/kategori/yoga"],
  ]) {
    const page = loadComponent(file, { "@/components/categoryOverview": { default: noop } });
    const searchParams = Promise.resolve({});
    const element = await page.default({ params: Promise.resolve(params), searchParams });
    assert.equal(element.type, noop);
    assert.deepEqual(element.props, { id: "yoga", returnTo, searchParams });
  }
});

test("category overview uses the actual home overview with a fixed category", async () => {
  const calls = [];
  const category = { id: 42, name: "yoga" };
  const overview = loadOverview(category, calls);
  const searchParams = Promise.resolve({ tab: "mine" });
  const element = await overview({ id: "yoga", returnTo: "/yoga", searchParams });
  assert.equal(element.props.title, "Yoga");
  assert.equal(element.props.bare, true);
  assert.equal(element.props.scrollToTopOnMount, false);
  assert.deepEqual(calls, [["auth", "/yoga"], ["resolve", "yoga", "/yoga"]]);
  const sharedOverview = element.props.children.props.children;
  assert.equal(sharedOverview.type, noop);
  assert.deepEqual(sharedOverview.props, { categoryScope: category, returnTo: "/yoga", searchParams });
});

test("unknown categories return not-found without requesting an unfiltered event list", async () => {
  const calls = [];
  const overview = loadOverview(undefined, calls);
  await assert.rejects(overview({ id: "unknown", returnTo: "/unknown", searchParams: Promise.resolve({}) }), /NOT_FOUND/);
  assert.deepEqual(calls, [["auth", "/unknown"], ["resolve", "unknown", "/unknown"]]);
});

test("shared home overview keeps full controls and scopes waitlists to category event IDs", async () => {
  const category = { id: 42, name: "Yoga" };
  const calls = [];
  const state = { tab: "ventelister", onlyRegistered: false, categories: [], showPast: false, search: "", year: null };
  const entries = [{ event: { id: "yoga-event" } }, { event: { id: "other-event" } }];
  const overview = loadComponent("./homeOverview.tsx", {
    "@/auth/token": { checkToken: async path => { calls.push(["auth", path]); }, getUser: async () => ({ email: "viewer" }) },
    "@/service/eventQueries": {
      getAllCategories: async () => [category],
      getEvents: async (query, path) => { calls.push(["events", query, path]); return [{ event: { id: "yoga-event" } }]; },
    },
    "@/service/waitlistQueries": { getMyWaitlists: async () => entries },
    "@/service/overviewQueries": {},
    "@/service/overviewState": { loadHomeState: async () => state, homeView: current => current.tab },
    "@/service/eventListQuery": queries,
    "./eventFilters": { default: noop, OverviewCreateLink: noop },
    "./overviewResults": { default: noop, WaitlistResults: noop },
    "./resultsBoundary": { default: noop },
    "./eventResultsSkeleton": { default: noop, OVERVIEW_RESULTS_ID: "overview-results" },
    "./overviewTransition": { OverviewTransition: noop },
  }).default;
  const element = await overview({ categoryScope: category, returnTo: "/yoga", searchParams: Promise.resolve({}) });
  const children = element.props.children.props.children;
  assert.deepEqual(children[0].props, { categories: [category], categoryScope: category });
  const results = children[1].props.children.props.children.props.children;
  const rendered = await results.type(results.props);
  assert.deepEqual(rendered.props.entries, [entries[0]]);
  assert.equal(rendered.props.categoryScope, category);
  assert.deepEqual(calls, [["auth", "/yoga"], ["events", { categories: [category] }, "/yoga"]]);
});

test("category-scoped overview also filters backend joined responses that contain other categories", async () => {
  const category = { id: 42, name: "Yoga" };
  const yoga = { event: { id: "yoga" }, categories: [category] };
  const unrelated = { event: { id: "other" }, categories: [{ id: 43, name: "Other" }] };
  const calls = [];
  const service = loadComponent("../service/overviewQueries.ts", {
    "server-only": {},
    "./eventListQuery": queries,
    "./eventQueries": {
      getEvents: async (query, path) => { calls.push([query, path]); return [yoga, unrelated]; },
    },
  });
  const state = { tab: "alle", categories: [], onlyRegistered: true, showPast: false };
  assert.deepEqual(await service.loadOverview(state, [], category, "/yoga"), [yoga]);
  assert.deepEqual(calls, [[{ onlyJoined: true, onlyFuture: true, categories: [category] }, "/yoga"]]);
});