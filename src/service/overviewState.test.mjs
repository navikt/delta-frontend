import assert from "node:assert/strict";
import { test } from "node:test";
import { createSerializer } from "nuqs/server";
import { homeParsers, loadHomeState, homeTabUpdate, homeView, toggleHomeQuickFilter } from "./overviewState.ts";

test("actual nuqs parsers preserve legacy links and canonical category writes", () => {
  const state = loadHomeState("?tab=mine&showPast=1&onlyRegistered=1&categories=%20sosialt%20,bl%C3%A5,sosialt&time=past");
  assert.equal(state.showPast, true);
  assert.equal(state.onlyRegistered, true);
  assert.deepEqual(state.categories, ["blå", "sosialt"]);
  assert.equal(state.time, "past");
  const serialize = createSerializer(homeParsers);
  assert.equal(new URLSearchParams(serialize("?unknown=keep", {
    categories: ["sosialt", "blå", "sosialt"], showPast: true, onlyRegistered: true,
  })).toString(), "unknown=keep&categories=bl%C3%A5%2Csosialt&showPast=1&onlyRegistered=1");
  const invalid = loadHomeState("?tab=joined&showPast=true&onlyRegistered=invalid&time=invalid");
  assert.equal(invalid.tab, "alle");
  assert.equal(invalid.showPast, false);
  assert.equal(invalid.onlyRegistered, false);
  assert.equal(invalid.time, "future");
});

test("home tab resets are atomic and preserve unrelated parameters", () => {
  const serialize = createSerializer(homeParsers);
  assert.equal(serialize("?tab=mine&showPast=1&onlyRegistered=1&search=hello&extra=ok",
    homeTabUpdate("alle", true)), "?search=hello&extra=ok");
});

test("history year deep links round-trip without losing legacy flags, search or unrelated parameters", () => {
  const serialize = createSerializer(homeParsers);
  const url = serialize("?onlyRegistered=1&showPast=1&search=hello&extra=keep", { year: 2025 });
  assert.equal(url, "?onlyRegistered=1&showPast=1&search=hello&extra=keep&year=2025");
  const state = loadHomeState(url);
  assert.equal(state.year, 2025);
  assert.equal(state.showPast, true);
  assert.equal(state.onlyRegistered, true);
  assert.equal(state.search, "hello");
  assert.equal(serialize(url, homeTabUpdate("mine", true)),
    "?showPast=1&search=hello&extra=keep&year=2025&tab=mine");
  for (const query of ["", "?year=nope", "?year=1999", "?year=2101"]) {
    assert.equal(loadHomeState(query).year, null);
  }
});

test("Fagtorsdag combines with event types while type switches preserve it and custom categories", () => {
  assert.deepEqual(toggleHomeQuickFilter(["kompetanse"], "fagtorsdag"), ["fagtorsdag", "kompetanse"]);
  assert.deepEqual(toggleHomeQuickFilter(["fagtorsdag", "kompetanse", "universell utforming"], "sosialt"),
    ["fagtorsdag", "sosialt", "universell utforming"]);
  assert.deepEqual(toggleHomeQuickFilter(["fagtorsdag", "sosialt"], "sosialt"), ["fagtorsdag"]);
  assert.deepEqual(toggleHomeQuickFilter(["fagtorsdag", "kompetanse"], "fagtorsdag"), ["kompetanse"]);
  assert.deepEqual(toggleHomeQuickFilter(["fagtorsdag"], "bedriftidrettslaget"), ["bedriftidrettslaget", "fagtorsdag"]);
});

test("tab row maps Påmeldt to the legacy onlyRegistered flag and Ventelister to its own tab", () => {
  const serialize = createSerializer(homeParsers);
  assert.equal(loadHomeState("?tab=ventelister").tab, "ventelister");
  assert.equal(homeView(loadHomeState("?onlyRegistered=1")), "pameldt");
  assert.equal(homeView(loadHomeState("?tab=mine&onlyRegistered=1")), "pameldt");
  assert.equal(homeView(loadHomeState("?tab=ventelister")), "ventelister");
  assert.equal(homeView(loadHomeState("?tab=mine")), "mine");
  assert.equal(homeView(loadHomeState("")), "alle");
  assert.equal(serialize("?tab=mine&showPast=1&search=x", homeTabUpdate("pameldt", true)),
    "?search=x&onlyRegistered=1");
  assert.equal(serialize("?onlyRegistered=1&search=x", homeTabUpdate("ventelister", false)),
    "?search=x&tab=ventelister");
  assert.equal(serialize("?onlyRegistered=1", homeTabUpdate("mine", true)), "?tab=mine&showPast=1");
});
