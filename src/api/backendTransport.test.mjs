import assert from "node:assert/strict";
import { test } from "node:test";
import { backendScope, backendUrl } from "./backendConfig.ts";
import { BackendError, requestBackend } from "./backendTransport.ts";

test("backend URL and OBO scope follow environment and cluster", () => {
  assert.equal(backendUrl({ NODE_ENV: "production" }), "http://delta-backend");
  assert.equal(backendUrl({ NODE_ENV: "development" }), "http://localhost:8080");
  assert.equal(backendScope({ NEXT_PUBLIC_CLUSTER: "prod" }), "api://prod-gcp.delta.delta-backend/.default");
  assert.equal(backendScope({}), "api://dev-gcp.delta.delta-backend/.default");
});

test("requests carry the token, JSON content type, timeout and no-store", async () => {
  let seen;
  const fetchImpl = async (url, init) => {
    seen = { url, init };
    return Response.json({ ok: true });
  };
  const response = await requestBackend({
    baseUrl: "http://fixture",
    accessToken: "abc",
    path: "/api/x",
    init: { method: "POST", body: "{}" },
    fetchImpl,
  });
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(seen.url, "http://fixture/api/x");
  assert.equal(seen.init.headers.Authorization, "Bearer abc");
  assert.equal(seen.init.headers["Content-Type"], "application/json");
  assert.equal(seen.init.cache, "no-store");
  assert.ok(seen.init.signal instanceof AbortSignal);
});

test("a missing token sends no Authorization header", async () => {
  let headers;
  await requestBackend({
    baseUrl: "http://fixture",
    accessToken: null,
    path: "/",
    fetchImpl: async (_url, init) => {
      headers = init.headers;
      return Response.json([]);
    },
  });
  assert.equal(headers.Authorization, undefined);
});

test("failures become BackendError with sanitized details", async () => {
  const longMessage = "x".repeat(900);
  await assert.rejects(
    requestBackend({
      baseUrl: "http://secret-host",
      accessToken: "tok",
      path: "/",
      fetchImpl: async () => Response.json({ error: longMessage }, { status: 403 }),
    }),
    (error) =>
      error instanceof BackendError &&
      error.status === 403 &&
      error.responseMessage.length === 500 &&
      !error.message.includes("secret-host"),
  );
  await assert.rejects(
    requestBackend({
      baseUrl: "http://secret-host",
      accessToken: "tok",
      path: "/",
      fetchImpl: async () => new Response("unauthenticated", { status: 401 }),
    }),
    (error) => error.status === 401 && error.responseMessage === "unauthenticated",
  );
  await assert.rejects(
    requestBackend({
      baseUrl: "http://secret-host",
      accessToken: "tok",
      path: "/",
      fetchImpl: async () => {
        throw new TypeError("connect ECONNREFUSED http://secret-host");
      },
    }),
    (error) => error instanceof BackendError && error.status === undefined && !error.message.includes("secret-host"),
  );
});
