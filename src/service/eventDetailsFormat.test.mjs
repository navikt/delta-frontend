import assert from "node:assert/strict";
import { test } from "node:test";
import { formatEventDateParts, formatEventSummary, getSeatStatus, seatStatusLabel } from "./eventDetailsFormat.ts";

test("hero summary capitalizes the weekday and joins same-day times", () => {
  const event = { startTime: "2026-11-18T14:00:00", endTime: "2026-11-18T16:00:00" };
  assert.equal(formatEventSummary(event), "Onsdag 18. november · 14:00–16:00");
  assert.deepEqual(formatEventDateParts(event), { date: "Onsdag 18. november", time: "14:00–16:00" });
});

test("multi-day events show both endpoints and the duration", () => {
  const event = { startTime: "2026-11-18T14:00:00", endTime: "2026-11-19T16:00:00" };
  assert.equal(formatEventSummary(event), "Onsdag 18. november 14:00 – Torsdag 19. november 16:00");
  assert.deepEqual(formatEventDateParts(event), {
    date: "Onsdag 18. november 14:00 – Torsdag 19. november 16:00",
    time: "Varighet: en dag, 2 timer",
  });
});

test("coming-soon placeholder times are not shown as a time range", () => {
  const event = { startTime: "2026-11-18T00:00:00", endTime: "2026-11-18T00:01:00" };
  assert.equal(formatEventSummary(event), "Onsdag 18. november · Kommer senere");
});

test("seat status distinguishes unlimited, full, few and available seats", () => {
  assert.deepEqual(getSeatStatus(40, 0), { kind: "unlimited" });
  assert.deepEqual(getSeatStatus(40, 40), { kind: "full" });
  assert.deepEqual(getSeatStatus(42, 40), { kind: "full" });
  assert.deepEqual(getSeatStatus(31, 40), { kind: "few", remaining: 9 });
  assert.deepEqual(getSeatStatus(30, 40), { kind: "available", remaining: 10 });
  assert.equal(seatStatusLabel(getSeatStatus(40, 40)), "Fullt");
  assert.equal(seatStatusLabel(getSeatStatus(39, 40)), "Kun 1 plass igjen");
  assert.equal(seatStatusLabel(getSeatStatus(35, 40)), "Kun 5 plasser igjen");
  assert.equal(seatStatusLabel(getSeatStatus(10, 40)), null);
});
