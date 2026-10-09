import assert from "node:assert/strict";
import { test } from "node:test";
import {
  parseRoomAvailabilityProblem,
  roomAvailabilityErrorMessage,
  toRoomAvailabilityFailure,
} from "./roomAvailabilityProblem.ts";

test("localizes invalid merged free/busy interval errors", () => {
  const failure = toRoomAvailabilityFailure(
    400,
    undefined,
    {
      type: "about:blank",
      title: "Room availability request rejected",
      status: 400,
      detail:
        "Failed to get room availability. Microsoft Graph rejected the availability request. Check the time range and slot interval.",
      code: "ErrorInvalidMergedFreeBusyInterval",
      upstreamStatus: 400,
      requestId: "req-short",
    },
    "fallback",
  );

  assert.equal(failure.code, "ErrorInvalidMergedFreeBusyInterval");
  assert.equal(failure.upstreamStatus, 400);
  assert.equal(failure.requestId, "req-short");
  assert.equal(
    roomAvailabilityErrorMessage(failure),
    "Kunne ikke hente ledighet for rommet. Microsoft avviste tidsrommet. Juster start- og sluttidspunktet, og prøv igjen.",
  );
});

test("preserves structured 502 problem details without assuming Microsoft is unavailable", () => {
  const problem = {
    type: "about:blank",
    title: "Room availability service failed",
    status: 502,
    detail: "Room access is not configured.",
    code: "RoomAccessNotConfigured",
    upstreamStatus: null,
    requestId: "req-502",
  };

  const failure = toRoomAvailabilityFailure(502, undefined, problem, "fallback");

  assert.deepEqual(parseRoomAvailabilityProblem(problem), problem);
  assert.deepEqual(failure, { ok: false, ...problem, message: problem.detail });
  assert.equal(roomAvailabilityErrorMessage(failure), problem.detail);
});

test("uses safe detail for unknown codes and handles null structured fields", () => {
  const failure = toRoomAvailabilityFailure(
    502,
    undefined,
    {
      type: "about:blank",
      title: "Request failed",
      status: 502,
      detail: "Availability could not be retrieved.",
      code: null,
      upstreamStatus: null,
      requestId: null,
    },
    "fallback",
  );

  assert.equal(failure.code, null);
  assert.equal(failure.upstreamStatus, null);
  assert.equal(failure.requestId, null);
  assert.equal(roomAvailabilityErrorMessage(failure), "Availability could not be retrieved.");

  const unknownCode = toRoomAvailabilityFailure(
    400,
    undefined,
    { detail: "The requested time range is unsupported.", code: "NewGraphCode" },
    "fallback",
  );
  assert.equal(roomAvailabilityErrorMessage(unknownCode), "The requested time range is unsupported.");
});

test("keeps plain-text local validation errors", () => {
  const failure = toRoomAvailabilityFailure(400, "Start time must be before end time.", undefined, "fallback");

  assert.equal(failure.message, "Start time must be before end time.");
  assert.equal(roomAvailabilityErrorMessage(failure), "Start time must be before end time.");
});
