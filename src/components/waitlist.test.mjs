import assert from "node:assert/strict";
import { test } from "node:test";
import { Children, isValidElement } from "react";
import { loadComponent } from "../test-support/loadComponent.mjs";

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
