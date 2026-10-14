import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchEventList, normalizeEventListQuery, ApiError } from "./eventListTransport.ts";

test("event queries distinguish an empty success from backend and network failures", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const logs = [];
  console.error = (...args) => logs.push(args);
  try {
    globalThis.fetch = async () => Response.json([]);
    assert.deepEqual(await fetchEventList("http://fixture", {}, null), []);
    for (const status of [400, 503]) {
      globalThis.fetch = async () => new Response("secret backend detail", { status });
      await assert.rejects(fetchEventList("http://fixture", {}, null),
        (error) => error instanceof ApiError && error.status === status && !error.message.includes("secret"));
    }
    globalThis.fetch = async () => { throw new Error("secret token"); };
    await assert.rejects(fetchEventList("http://fixture", {}, null), ApiError);
    assert.equal(JSON.stringify(logs).includes("secret"), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

test("category IDs are deduplicated and retain the backend AND query", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "http://fixture/event?categories=2%2C7&onlyFuture=true&onlyJoined=true");
      assert.equal(options.cache, "no-store");
      return Response.json([]);
    };
    const query = normalizeEventListQuery({
      categories: [{ id: 7 }, { id: 2 }, { id: 7 }],
      onlyFuture: true, onlyJoined: true,
    });
    await fetchEventList("http://fixture", query, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
