import assert from "node:assert/strict";
import { test } from "node:test";
import { claimOverviewReturn, resolveOverviewReturn } from "./overviewReturn.ts";

const overview = "/mim?tab=joined&search=design&custom=1";
const pending = JSON.stringify({ path: overview });

test("a card click is claimed once by the detail entry it opened", () => {
  const claimed = claimOverviewReturn(pending, 4);
  assert.deepEqual(JSON.parse(claimed), { path: overview, historyLength: 4 });
  assert.equal(claimOverviewReturn(claimed, 7), null);
  assert.equal(claimOverviewReturn(null, 4), null);
});

test("back is used only while the detail entry is still the one opened from the overview", () => {
  const claimed = claimOverviewReturn(pending, 4);
  assert.deepEqual(resolveOverviewReturn(claimed, 4), { kind: "back" });
  assert.deepEqual(resolveOverviewReturn(claimed, 6), { kind: "push", path: overview });
  assert.deepEqual(resolveOverviewReturn(pending, 4), { kind: "push", path: overview });
});

test("missing, malformed or foreign stored paths fall back to the static back link", () => {
  for (const path of ["https://outside.example", "//outside.example", "/\\outside.example", "/\t/outside.example", "", 42]) {
    assert.equal(resolveOverviewReturn(JSON.stringify({ path, historyLength: 4 }), 4), null);
  }
  for (const stored of [null, "", "not json", "null", "[]", "\"/\""]) {
    assert.equal(resolveOverviewReturn(stored, 4), null);
  }
});
