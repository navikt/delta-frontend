import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createRequire } from "node:module";
import {
  festivals,
  getFestivalEventPath,
  getFestivalEventUrl,
  getFestivalReturnTo,
} from "./festivals.ts";

test("festival detail configuration preserves each route's theme and organizer", () => {
  assert.deepEqual(Object.keys(festivals), ["fagfest", "ips", "mim", "pride", "markedsuka"]);
  assert.deepEqual(festivals.fagfest, {
    slug: "fagfest", backText: "FAGFEST", titleColor: "#ec38a7", bgClass: "bg-fagfestival",
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
      assert.equal(festival.bgClass, "colorful");
      assert.equal(festival.titleColor, "#021841");
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
  assert.equal(details.match(/copyText=\{eventUrl\}/g)?.length, 2);
  assert.match(details, /text=\{eventUrl\}/);
});

test("festival return links retain local URLs and fall back to the correct overview", () => {
  const returnTo = "/mim?tab=joined&search=design&custom=1";
  const externalPayloads = [
    "https://outside.example",
    "//outside.example",
    "/\\outside.example",
    "/\\\\outside.example",
    "/\t/outside.example",
  ];
  for (const festival of Object.values(festivals)) {
    for (const invalid of [undefined, "", ...externalPayloads, []]) {
      assert.equal(getFestivalReturnTo(festival, invalid), `/${festival.slug}`);
    }
    assert.equal(getFestivalReturnTo(festival, returnTo), returnTo);
    assert.equal(getFestivalReturnTo(festival, [returnTo, "/ignored"]), returnTo);
  }
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

test("legacy fagtorsdag redirects remain temporary and do not affect the category", async () => {
  const require = createRequire(import.meta.url);
  const config = require("../../../next.config.js");
  const redirects = await config.redirects();
  assert.deepEqual(redirects.filter(({ source }) => source.startsWith("/fagtorsdag")), [
    { source: "/fagtorsdag/:id", destination: "/event/:id", permanent: false },
    { source: "/fagtorsdag", destination: "/?categories=fagtorsdag", permanent: false },
  ]);
});
