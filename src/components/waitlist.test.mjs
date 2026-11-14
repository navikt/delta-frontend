import assert from "node:assert/strict";
import { test } from "node:test";
import { Children, isValidElement } from "react";
import * as React from "react";
import { loadComponent } from "../test-support/loadComponent.mjs";

function interactiveComponent(url, mocks) {
  const states = [];
  let cursor = 0;
  const Component = loadComponent(url, {
    ...mocks,
    react: {
      ...React,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (next) => {
          states[index] = typeof next === "function" ? next(states[index]) : next;
        }];
      },
      useTransition: () => [false, (action) => action()],
    },
  }).default;
  return (props) => {
    cursor = 0;
    return Component(props);
  };
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  return isValidElement(node) ? [node, ...elements(node.props.children)] : [];
}

function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  return isValidElement(node) ? text(node.props.children) : String(node ?? "");
}

test("ordinary and festival registration controls block mutations until committed state is refreshed", async () => {
  for (const path of ["../app/event/[id]/eventDetails.tsx", "./fagfestival/detail/eventDetails.tsx"]) {
    const Stub = () => null;
    const Button = () => null;
    const Notice = () => null;
    const Modal = Object.assign(() => null, { Body: Stub, Footer: Stub });
    let mutations = 0;
    const render = interactiveComponent(new URL(path, import.meta.url), {
      "@navikt/ds-react": {
        Button, Modal, Alert: Stub, Heading: Stub, BodyLong: Stub, Tag: Stub,
        LocalAlert: Object.assign(() => null, { Content: Stub }),
      },
      "@navikt/aksel-icons": { TrashIcon: Stub, PencilIcon: Stub, BarChartIcon: Stub, FilePlusIcon: Stub },
      "next/link": { default: Stub },
      "next-qrcode": { useQRCode: () => ({ Canvas: Stub }) },
      "./eventDescription": { default: Stub },
      "@/service/eventActions": {},
      "@/service/waitlistActions": {
        changeEventRegistration: async () => { mutations++; return { ok: true, refreshRequired: true }; },
      },
      "@/service/eventCapacity": {
        isInvitationReservationActive: () => false,
        countCapacityAttendees: (participants, hosts) => participants.length + hosts.length,
      },
      "@/components/MarkdownRenderer": { default: Stub },
      "@/components/calendar": { default: Stub },
      "@/components/SecondaryCopyButton": { default: Stub },
      "@/components/editScopeModal": { default: Stub },
      "@/components/RecurringBadge": { RecurringBadge: Stub },
      "@/components/calendarSyncStatus": { default: Stub },
      "@/components/waitlistControls": { default: Stub },
      "@/components/registrationRefreshNotice": { default: Notice },
      "../festivals": { getFestivalEventUrl: () => "/fixture" },
    });
    const props = {
      event: {
        id: "fixture", title: "Fixture", description: "", location: "Office", participantLimit: 2,
        startTime: "2099-04-28T12:00:00", endTime: "2099-04-28T13:00:00",
      },
      participants: [], hosts: [{ email: "host@fixture", name: "Host" }], categories: [],
      invitationCapacity: { reservedInvitations: 0, hasOwnReservation: false },
      user: { email: "viewer@fixture" }, festival: {},
    };
    const button = (tree, label) => elements(tree).find((element) => element.type === Button && text(element) === label);
    button(render(props), "Bli med").props.onClick();
    const mutation = button(render(props), "Godta og bli med").props.onClick();
    const confirmation = elements(render(props)).find((element) => element.type === Modal && element.props["aria-label"] === "Meld av modal");
    await button(confirmation, "Avbryt").props.onClick();
    await mutation;

    const stale = render(props);
    const notice = elements(stale).find((element) => element.type === Notice);
    assert.ok(notice, `${path}: show read-only recovery after a committed mutation`);
    assert.equal(button(stale, "Bli med"), undefined);
    assert.equal(button(stale, "Meld av"), undefined);
    assert.equal(elements(stale).find((element) => element.type === Modal && element.props["aria-label"] === "Meld av modal").props.open, false);
    notice.props.onUpdated({
      participants: [{ email: "viewer@fixture", name: "Viewer" }],
      invitationCapacity: props.invitationCapacity,
    });
    const fresh = render(props);
    assert.equal(elements(fresh).some((element) => element.type === Notice), false);
    assert.ok(button(fresh, "Meld av"));
    assert.equal(mutations, 1);
  }
});

test("committed membership changes survive a failed refresh and retry only the read", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const action of ["changeWaitlist", "changeEventRegistration"]) {
    for (const leave of [false, true]) {
      let mutations = 0;
      let reads = 0;
      let failRead = true;
      const state = { participants: [], invitationCapacity: { reservedInvitations: 0, hasOwnReservation: false } };
      const actions = loadComponent(new URL("../service/waitlistActions.ts", import.meta.url), {
        "@/auth/token": { checkToken: async () => {} },
        "@/api/instance": {
          getApi: async () => ({
            post: async () => { mutations++; },
            delete: async () => { mutations++; },
          }),
        },
        "./eventInteractiveReads": {
          getEventRegistrationState: async () => {
            reads++;
            if (failRead) throw new Error("Synthetic read outage");
            return state;
          },
        },
        "next/navigation": { unstable_rethrow: () => {} },
      });

      const changed = await actions[action]("fixture-event", leave);

      assert.equal(changed.ok, true, `${action}: a failed read must not undo the reported mutation success`);
      assert.equal(changed.refreshRequired, true);
      assert.equal(mutations, 1);
      assert.equal(reads, 1);
      const failedRetry = await actions.refreshEventRegistration("fixture-event");
      assert.equal(failedRetry.ok, false);
      failRead = false;
      const refreshed = await actions.refreshEventRegistration("fixture-event");
      assert.equal(refreshed.ok, true);
      assert.deepEqual(refreshed.data, state);
      assert.equal(mutations, 1, "state recovery must never repeat the committed mutation");
      assert.equal(reads, 3);
    }
  }
});

test("mutation failures do not refresh and successful refreshes preserve the current registration state", async (t) => {
  t.mock.method(console, "error", () => {});
  for (const action of ["changeWaitlist", "changeEventRegistration"]) {
    let failMutation = true;
    let reads = 0;
    const state = { participants: [], invitationCapacity: { reservedInvitations: 0, hasOwnReservation: false } };
    const actions = loadComponent(new URL("../service/waitlistActions.ts", import.meta.url), {
      "@/auth/token": { checkToken: async () => {} },
      "@/api/instance": { getApi: async () => ({
        post: async () => { if (failMutation) throw new Error("Synthetic mutation outage"); },
      }) },
      "./eventInteractiveReads": { getEventRegistrationState: async () => { reads++; return state; } },
      "next/navigation": { unstable_rethrow: () => {} },
    });
    assert.equal((await actions[action]("fixture", false)).ok, false);
    assert.equal(reads, 0);
    failMutation = false;
    assert.deepEqual(await actions[action]("fixture", false), { ok: true, refreshRequired: false, data: state });
    assert.equal(reads, 1);
  }
});

test("queue joins and departures close their confirmation and request read-only recovery after a failed refresh", async () => {
  for (const queued of [false, true]) {
    const Stub = () => null;
    const Button = () => null;
    const Checkbox = () => null;
    const Modal = Object.assign(() => null, { Body: Stub, Footer: Stub });
    const updates = [];
    const mutations = [];
    const render = interactiveComponent(new URL("./waitlistControls.tsx", import.meta.url), {
      "@navikt/ds-react": {
        Button, Checkbox, Modal, LocalAlert: Object.assign(() => null, { Content: Stub }),
      },
      "@/service/waitlistActions": {
        changeWaitlist: async (...args) => { mutations.push(args); return { ok: true, refreshRequired: true }; },
      },
    });
    const props = {
      eventId: "fixture", state: { position: queued ? 2 : null, count: 2, open: true },
      onUpdated: (updated) => updates.push(updated),
    };
    const button = (tree, label) => elements(tree).find((element) => element.type === Button && text(element) === label);
    button(render(props), queued ? "Forlat ventelisten" : "Sett meg på venteliste").props.onClick();
    if (!queued) elements(render(props)).find((element) => element.type === Checkbox).props.onChange({ target: { checked: true } });
    await button(render(props), queued ? "Ja, forlat ventelisten" : "Godta og sett meg på venteliste").props.onClick();

    assert.deepEqual(mutations, [["fixture", queued]]);
    assert.deepEqual(updates, [null], "the parent must gate all membership controls until a fresh snapshot is available");
    assert.equal(elements(render(props)).find((element) => element.type === Modal).props.open, false);
  }
});

test("the refresh notice retries only reads and keeps recovery available through repeated failures", async () => {
  const Stub = () => null;
  const Button = () => null;
  let reads = 0;
  const updates = [];
  const state = { participants: [], invitationCapacity: { reservedInvitations: 0, hasOwnReservation: false } };
  const render = interactiveComponent(new URL("./registrationRefreshNotice.tsx", import.meta.url), {
    "@navikt/ds-react": { Button, LocalAlert: Object.assign(() => null, { Content: Stub }) },
    "@/service/waitlistActions": {
      refreshEventRegistration: async (id) => {
        assert.equal(id, "fixture");
        reads++;
        return reads < 3 ? { ok: false, message: "Synthetic read failure" } : { ok: true, data: state };
      },
      changeWaitlist: () => assert.fail("recovery must not mutate queue membership"),
      changeEventRegistration: () => assert.fail("recovery must not mutate registration"),
    },
  });
  const props = { eventId: "fixture", onUpdated: (updated) => updates.push(updated) };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const tree = render(props);
    assert.match(text(tree), /Endringen er lagret/);
    const buttons = elements(tree).filter((element) => element.type === Button);
    assert.equal(buttons.length, 1);
    assert.equal(text(buttons[0]), "Oppdater status");
    await buttons[0].props.onClick();
    if (attempt < 3) {
      assert.deepEqual(updates, []);
      assert.match(text(render(props)), /Synthetic read failure/);
    }
  }
  assert.equal(reads, 3);
  assert.deepEqual(updates, [state]);
});

test("wait-list read failures refetch through retry rather than only resetting the boundary", () => {
  const ErrorPage = loadComponent(new URL("../app/waitlist/error.tsx", import.meta.url), {
    "@/components/resultsBoundary": { ReadFailure: () => null },
  }).default;
  let retries = 0;
  let resets = 0;
  const fallback = ErrorPage({
    error: new Error("Synthetic outage"),
    retry: () => { retries++; },
    reset: () => { resets++; },
  });

  fallback.props.retry();

  assert.equal(retries, 1);
  assert.equal(resets, 0);
});

test("refreshed host queues reset stale local state only when the queue snapshot changes", async () => {
  const first = { email: "first@fixture", name: "First", position: 1 };
  const second = { email: "second@fixture", name: "Second", position: 2 };
  let entries = [first, second];
  const Queue = () => null;
  const Page = loadComponent(new URL("../app/event/[id]/admin/page.tsx", import.meta.url), {
    "@/auth/token": { checkToken: async () => {}, getUser: async () => ({ email: "host@fixture" }) },
    "@/components/cardWithBackground": { default: () => null },
    "./participantPage": { default: () => null },
    "@/components/waitlistManager": { default: Queue },
    "@/service/eventQueries": {
      getEvent: async () => ({
        event: { id: "fixture-event", title: "Queue fixture", waitlistEnabled: true },
        hosts: [{ email: "host@fixture" }],
      }),
    },
    "@/service/roomQueries": { getFeatures: async () => ({}) },
    "@/service/waitlistQueries": { getWaitlistEntries: async () => entries },
  }).default;
  const renderQueue = async () => {
    const page = await Page({ params: Promise.resolve({ id: "fixture-event" }) });
    const queue = Children.toArray(page.props.children).find((child) => isValidElement(child) && child.type === Queue);
    assert.ok(queue);
    return queue;
  };
  let previous = await renderQueue();
  entries = entries.map((entry) => ({ ...entry }));
  assert.equal((await renderQueue()).key, previous.key, "unchanged snapshots must preserve local interaction state");

  for (const snapshot of [
    [{ ...second, position: 1 }],
    [{ ...second, name: "Updated name", position: 1 }],
    [],
  ]) {
    entries = snapshot;
    const refreshed = await renderQueue();
    assert.notEqual(refreshed.key, previous.key, "changed queues must reset stale entries and pending selection");
    assert.deepEqual(refreshed.props.initialEntries, snapshot);
    previous = refreshed;
  }
});
