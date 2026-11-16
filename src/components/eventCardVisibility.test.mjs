import assert from "node:assert/strict";
import { test } from "node:test";
import { getHomeCategoryNames, shouldHideEventCard } from "./eventCardVisibility.ts";

const eventCategories = [{ id: 1, name: "fagdag_utvikling_og_data" }];

test("home category choices only include tags on eligible events, not hidden or closed events", () => {
  const event = (names, signupDeadline) => ({
    event: { signupDeadline },
    categories: names.map((name, id) => ({ id, name })),
  });
  const events = [
    event(["sosialt", "kompetanse"]),
    event(["kompetanse", "fagtorsdag"], "2026-11-17T10:00:00Z"),
    event(["IPS", "ips-only"]),
    event(["Markedsuka", "marketing-only"]),
    event(["fagdag_utvikling_og_data", "hidden-only"]),
    event(["expired-only"], "2026-11-16T08:00:00Z"),
    event([]),
  ];
  assert.deepEqual(getHomeCategoryNames(events, Date.parse("2026-11-16T09:00:00Z")),
    ["fagtorsdag", "kompetanse", "sosialt"]);
  assert.deepEqual(getHomeCategoryNames([], Date.now()), []);
});

test("does not hide joined events when signup has closed", () => {
  assert.equal(
    shouldHideEventCard({
      tabname: "alle",
      categories: [],
      signupDeadlineExpired: true,
      showPast: false,
      showOnlyRegistered: true,
    }),
    false,
  );
});

test("does not hide joined events in normally hidden categories", () => {
  assert.equal(
    shouldHideEventCard({
      tabname: "alle",
      categories: eventCategories,
      signupDeadlineExpired: false,
      showPast: false,
      showOnlyRegistered: true,
    }),
    false,
  );
});

test("keeps hiding expired events from the regular upcoming list", () => {
  assert.equal(
    shouldHideEventCard({
      tabname: "alle",
      categories: [],
      signupDeadlineExpired: true,
      showPast: false,
      showOnlyRegistered: false,
    }),
    true,
  );
});
