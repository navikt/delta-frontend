import assert from "node:assert/strict";
import { test } from "node:test";
import {
  optionAvailabilityText,
  requiresWaitlist,
  toSignupOptionRequests,
  usesWaitlist,
  validateSignupOptionDrafts,
} from "./signupOptions.ts";

const option = (overrides = {}) => ({
  id: "physical", label: "Fysisk", participantLimit: 2, waitlistEnabled: false,
  allocatedSeats: 0, waitlistCount: 0, ...overrides,
});

test("availability explains free places, full options and wait lists", () => {
  assert.equal(optionAvailabilityText(option({ allocatedSeats: 1 })), "1 ledig plass av 2");
  assert.equal(optionAvailabilityText(option({ participantLimit: 0, allocatedSeats: 40 })), "Ingen begrensning på antall plasser");
  assert.equal(optionAvailabilityText(option({ allocatedSeats: 2 })), "Fullt");
  assert.equal(optionAvailabilityText(option({ allocatedSeats: 2, waitlistEnabled: true, waitlistCount: 3 })),
    "Fullt. Du kan stå på venteliste (3 står i kø).");
});

test("a queue in an option with free places still routes new people through the wait list", () => {
  assert.equal(requiresWaitlist(option({ waitlistEnabled: true, waitlistCount: 1 })), true);
  assert.equal(requiresWaitlist(option({ waitlistEnabled: true })), false);
  assert.equal(requiresWaitlist(option({ allocatedSeats: 2 })), false);
  assert.equal(usesWaitlist({ waitlistEnabled: false, signupOptions: [option(), option({ waitlistEnabled: true })] }), true);
  assert.equal(usesWaitlist({ waitlistEnabled: false, signupOptions: [option()] }), false);
});

test("drafts need two uniquely named options and a limit when the wait list is on", () => {
  const draft = (id, label, limit = "", waitlistEnabled = false) => ({ id, label, limit, waitlistEnabled });
  assert.deepEqual(validateSignupOptionDrafts([draft("a", "Fysisk")]), {
    rows: {}, group: "Legg til minst 2 alternativer",
  });
  assert.deepEqual(validateSignupOptionDrafts([
    draft("a", "Fysisk", "0"), draft("b", " fysisk ", "", true), draft("c", "  "),
  ]).rows, {
    a: { limit: "Må være mellom 1 og 9999, eller tomt" },
    b: { label: "To alternativer kan ikke ha samme navn", limit: "Venteliste krever et maksimalt antall plasser" },
    c: { label: "Du må gi alternativet et navn" },
  });
  assert.equal(validateSignupOptionDrafts([draft("a", "Fysisk", "30", true), draft("b", "Digitalt")]), null);
  assert.equal(validateSignupOptionDrafts([draft("a", "Fysisk")], 1), null);
  assert.equal(validateSignupOptionDrafts([], 1).group, "Behold minst ett alternativ");
  assert.deepEqual(toSignupOptionRequests([draft("a", " Fysisk ", "30", true), draft("b", "Digitalt", "", true)]), [
    { id: "a", label: "Fysisk", participantLimit: 30, waitlistEnabled: true },
    { id: "b", label: "Digitalt", participantLimit: 0, waitlistEnabled: false },
  ]);
});
