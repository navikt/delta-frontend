import assert from "node:assert/strict";
import { test } from "node:test";
import { extractErrorMessage, parseErrorBody, parseProblemDetails } from "./problemDetails.ts";

test("prefers detail, then message, then error", () => {
  assert.equal(extractErrorMessage({ detail: " d ", message: "m", error: "e" }), "d");
  assert.equal(extractErrorMessage({ message: "m", error: "e" }), "m");
  assert.equal(extractErrorMessage({ error: "e" }), "e");
  assert.equal(extractErrorMessage({ detail: "  ", message: "m" }), "m");
});

test("ignores non-string fields and non-object bodies", () => {
  assert.equal(extractErrorMessage({ detail: 1, message: {} }), undefined);
  assert.equal(extractErrorMessage(null), undefined);
  assert.equal(extractErrorMessage([]), undefined);
  assert.equal(extractErrorMessage(""), undefined);
});

test("truncates long messages", () => {
  assert.equal(extractErrorMessage("x".repeat(600))?.length, 500);
  assert.equal(extractErrorMessage({ detail: "y".repeat(600) })?.length, 500);
});

test("parses problem+json, legacy JSON and plain text bodies", () => {
  const problem = { title: "Bad", status: 400, detail: "Ugyldig tid", requestId: "r1" };
  assert.deepEqual(parseErrorBody(JSON.stringify(problem)), {
    message: "Ugyldig tid",
    problem,
  });
  assert.deepEqual(parseErrorBody('{"error":"nope"}'), { message: "nope", problem: undefined });
  assert.deepEqual(parseErrorBody("Invalid UUID"), { message: "Invalid UUID" });
  assert.deepEqual(parseErrorBody(""), {});
});

test("parseProblemDetails drops unknown fields", () => {
  assert.deepEqual(parseProblemDetails({ detail: "d", secret: "x" }), { detail: "d" });
  assert.equal(parseProblemDetails({ foo: 1 }), undefined);
});
