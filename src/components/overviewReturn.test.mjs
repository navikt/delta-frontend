import assert from "node:assert/strict";
import { test } from "node:test";
import { claimOverviewReturn, resolveOverviewReturn } from "./overviewReturn.ts";

const overview = "/mim?tab=joined&search=design&custom=1";
const pending = JSON.stringify({ path: overview, entryId: "click-1" });

test("a card click is claimed once by the detail history entry it opened", () => {
  const claim = claimOverviewReturn(pending, undefined);
  assert.equal(claim.marker, "click-1");
  assert.deepEqual(JSON.parse(claim.stored), { path: overview, entryId: "click-1", claimed: true });
  assert.equal(claimOverviewReturn(claim.stored, undefined), null);
  assert.equal(claimOverviewReturn(pending, "click-0"), null);
  assert.equal(claimOverviewReturn(null, undefined), null);
});

test("back is used only from the history entry marked for the card click", () => {
  const { stored } = claimOverviewReturn(pending, undefined);
  assert.deepEqual(resolveOverviewReturn(stored, "click-1"), { kind: "back" });
  // Same detail reached through another route (e.g. admin back link) or a lost/foreign marker.
  for (const marker of [undefined, "click-0", null]) {
    assert.deepEqual(resolveOverviewReturn(stored, marker), { kind: "push", path: overview });
  }
  assert.deepEqual(resolveOverviewReturn(pending, "click-1"), { kind: "push", path: overview });
});

test("missing, malformed or foreign stored paths fall back to the static back link", () => {
  for (const path of ["https://outside.example", "//outside.example", "/\\outside.example", "/\t/outside.example", "", 42]) {
    assert.equal(resolveOverviewReturn(JSON.stringify({ path, entryId: "click-1", claimed: true }), "click-1"), null);
  }
  for (const stored of [null, "", "not json", "null", "[]", "\"/\"", JSON.stringify({ path: overview })]) {
    assert.equal(resolveOverviewReturn(stored, "click-1"), null);
  }
});
