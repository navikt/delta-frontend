import assert from "node:assert/strict";
import { test } from "node:test";
import { initializeEventForm, eventFormIdentity } from "./eventFormInitial.ts";

const source = {
  event: { id: "original", title: "Title", description: "Body", location: "Oslo", public: false,
    participantLimit: 12, startTime: "2026-10-14T12:00:00Z", roomEmail: "room@fixture" },
  categories: [{ id: 2, name: "digitalt" }],
  recurringSeries: { frequency: "WEEKLY", untilDate: "2026-11-14" },
  hosts: [{ email: "host@fixture" }], participants: [{ email: "joined@fixture" }],
  invited: [{ email: "invited@fixture" }],
};

test("new, edit and template forms receive distinct source mappings without loading actions", () => {
  assert.deepEqual(initializeEventForm({ mode: "new" }), {
    richEvent: { type: 0 }, selectedCategories: [], existingAttendeeEmails: [],
  });
  const edit = initializeEventForm({ mode: "edit", source });
  assert.deepEqual(edit.richEvent, { type: 1, event: source.event, recurringSeries: source.recurringSeries });
  assert.deepEqual(edit.selectedCategories, [{ id: 2, name: "digitalt" }]);
  assert.deepEqual(edit.existingAttendeeEmails, ["host@fixture", "joined@fixture", "invited@fixture"]);
  assert.deepEqual(initializeEventForm({ mode: "template", source }).richEvent, {
    type: 2, event: { title: "Title", description: "Body", location: "Oslo", public: false, participantLimit: 12 },
  });
  assert.equal(eventFormIdentity({ mode: "template", source }), "template:original");
  assert.equal(eventFormIdentity({ mode: "edit", source }), "edit:original");
  assert.throws(() => initializeEventForm({ mode: "edit" }), /source/i);
  assert.throws(() => initializeEventForm({ mode: "template", source: null }), /source/i);
});
