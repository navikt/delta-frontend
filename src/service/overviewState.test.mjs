import assert from "node:assert/strict";
import { test } from "node:test";
import { createSerializer } from "nuqs/server";
import { homeParsers, loadHomeState, homeTabUpdate } from "./overviewState.ts";

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
