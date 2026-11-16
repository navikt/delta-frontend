import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesEventSearch } from "./eventSearch.ts";

const fullEvent = {
  event: { title: "Fagdag om Kotlin", location: "B104 Gnisten, Fyrstikkalléen" },
  hosts: [{ name: "Åse Ødegård" }, { name: "Ola Nordmann" }],
};

test("matches title, location and host names case-insensitively", () => {
  assert.equal(matchesEventSearch(fullEvent, "kotlin"), true);
  assert.equal(matchesEventSearch(fullEvent, "  GNISTEN "), true);
  assert.equal(matchesEventSearch(fullEvent, "åse"), true);
  assert.equal(matchesEventSearch(fullEvent, "ØDEGÅRD"), true);
  assert.equal(matchesEventSearch(fullEvent, "ola nordmann"), true);
  assert.equal(matchesEventSearch(fullEvent, "java"), false);
});

test("empty queries match and events without hosts or location are searchable", () => {
  assert.equal(matchesEventSearch(fullEvent, "   "), true);
  const bare = { event: { title: "Julebord", location: "" } };
  assert.equal(matchesEventSearch(bare, "jule"), true);
  assert.equal(matchesEventSearch(bare, "ola"), false);
});

test("every term must match somewhere", () => {
  assert.equal(matchesEventSearch(fullEvent, "kotlin ola"), true);
  assert.equal(matchesEventSearch(fullEvent, "kotlin kari"), false);
});
