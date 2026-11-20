import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createRequire } from "node:module";
import {
  festivals,
  getFestivalEventPath,
  getFestivalEventUrl,
} from "./festivals.ts";

test("festival detail configuration preserves each route's back link and organizer", () => {
  assert.deepEqual(Object.keys(festivals), ["fagfest", "ips", "mim", "pride", "markedsuka"]);
  assert.deepEqual(festivals.fagfest, {
    slug: "fagfest", backText: "FAGFEST",
    contact: { kind: "committee", label: "Fagfest", email: "fagfestival@nav.no" },
  });
  assert.deepEqual(festivals.ips.contact, { kind: "label", label: "IPS" });
  assert.deepEqual(festivals.mim.contact, {
    kind: "committee", label: "Mangfold i mai", email: "mangfold.i.mai@nav.no",
  });
  assert.deepEqual(festivals.pride.contact, { kind: "hosts" });
  assert.deepEqual(festivals.markedsuka.contact, { kind: "hosts" });
  for (const [slug, festival] of Object.entries(festivals)) {
    assert.equal(festival.slug, slug);
    if (slug !== "fagfest") {
      assert.equal(festival.backText, "Arrangementer");
    }
  }
});

test("copy links and QR codes share the correct festival path and configured hostname", () => {
  for (const festival of Object.values(festivals)) {
    assert.equal(getFestivalEventPath(festival, "event-123"), `/${festival.slug}/event-123`);
    assert.equal(getFestivalEventPath(festival, "a/b"), `/${festival.slug}/a%2Fb`);
    assert.equal(getFestivalEventUrl(festival, "event-123"), `https://delta.nav.no/${festival.slug}/event-123`);
    assert.equal(getFestivalEventUrl(festival, "event-123", "https://fixture.example/"),
      `https://fixture.example/${festival.slug}/event-123`);
  }
  const details = readFileSync(new URL("./detail/eventDetails.tsx", import.meta.url), "utf8");
  assert.match(details, /shareUrl=\{eventUrl\}/);
  assert.match(details, /qrText=\{eventUrl\}/);
});

test("literal detail routes and metadata select the same shared festival configuration", () => {
  for (const slug of Object.keys(festivals)) {
    const page = readFileSync(new URL(`../../app/${slug}/[id]/page.tsx`, import.meta.url), "utf8");
    assert.match(page, new RegExp(`generateFestivalMetadata\\(festivals\\.${slug}, props\\)`));
    assert.match(page, new RegExp(`festival=\\{festivals\\.${slug}\\}`));
    const notFound = readFileSync(new URL(`../../app/${slug}/not-found.tsx`, import.meta.url), "utf8");
    assert.match(notFound, /fagfestival\/detail\/notFound/);
  }
});

test("legacy fagtorsdag event links redirect without overriding the short category route", async () => {
  const require = createRequire(import.meta.url);
  const config = require("../../../next.config.js");
  const redirects = await config.redirects();
  assert.deepEqual(redirects.filter(({ source }) => source.startsWith("/fagtorsdag")), [
    { source: "/fagtorsdag/:id", destination: "/event/:id", permanent: false },
  ]);
});
