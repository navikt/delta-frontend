import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldHideEventCard } from "./eventCardVisibility.ts";

const eventCategories = [{ id: 1, name: "fagdag_utvikling_og_data" }];

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
