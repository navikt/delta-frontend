import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadBindings, transformSync } from "next/dist/build/swc/index.js";
import { festivals } from "../festivals.ts";
import { ApiError } from "../../../service/eventListTransport.ts";

await loadBindings();

function loadComponent(name, mocks) {
  const url = new URL(name, import.meta.url);
  const filename = fileURLToPath(url);
  const { code } = transformSync(readFileSync(url, "utf8"), {
    filename,
    jsc: { parser: { syntax: "typescript", tsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  const require = createRequire(url);
  runInThisContext(`(function(module, exports, require) { ${code}\n})`, { filename })(
    module, module.exports, (id) => Object.hasOwn(mocks, id) ? { __esModule: true, ...mocks[id] } : require(id),
  );
  return module.exports;
}

const noopComponent = () => null;
const capacity = loadComponent("../../../service/eventCapacity.ts", {});
const formatting = loadComponent("../../../service/format.ts", {});
const commonMocks = {
  "../festivals": { festivals, ...await import("../festivals.ts") },
  "@/service/eventCapacity": capacity,
  "@/service/format": formatting,
};
const participant = loadComponent("./participant.tsx", {}).default;
const calendarSyncStatus = loadComponent("../../calendarSyncStatus.tsx", {
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
  "@/service/eventActions": {},
}).default;
const roomStatus = loadComponent("../../roomStatusTag.tsx", {});
const eventDescription = loadComponent("../../../app/event/[id]/eventDescription.tsx", {
  ...commonMocks,
  "./participant": { default: participant },
  "@/components/RecurringBadge": { RecurringBadge: noopComponent },
  "@/components/roomStatusTag": roomStatus,
  "@/types/room": { NO_FEATURES: {} },
}).default;
const description = loadComponent("./eventDescription.tsx", {
  ...commonMocks, "./participant": { default: participant },
}).default;
const details = loadComponent("./eventDetails.tsx", {
  ...commonMocks,
  "./eventDescription": { default: description },
  "@/components/calendar": { default: noopComponent },
  "@/components/calendarSyncStatus": { default: calendarSyncStatus },
  "@/components/SecondaryCopyButton": {
    default: ({ copyText }) => createElement("button", { "data-copy-url": copyText }, "Kopier lenke"),
  },
  "next-qrcode": { useQRCode: () => ({ Canvas: noopComponent }) },
  "@/service/eventActions": {},
  "@/service/eventInteractiveReads": {},
}).default;

const fixture = {
  event: {
    id: "fixture-event", title: "Fixture", description: "Details", location: "Oslo",
    startTime: "2099-04-28T12:00:00", endTime: "2099-04-28T13:00:00",
    participantLimit: 0, public: true,
  },
  participants: [{ name: "Person, Joined", email: "joined@fixture" }],
  hosts: [{ name: "Person, Host", email: "host@fixture" }],
  categories: [],
  invited: [{ email: "invited@fixture", status: "INVITED" }],
  calendarSyncError: "Host-only error",
};
const user = { firstName: "Test", lastName: "Person", email: "viewer@fixture" };

function renderDetails(festival, overrides = {}) {
  return renderToStaticMarkup(createElement(details, {
    ...fixture, festival, user, hostname: "https://fixture.example",
    invitationCapacity: { reservedInvitations: 1, hasOwnReservation: false },
    ...overrides,
  }));
}

test("calendar status and its visibility hint are only rendered for hosts", () => {
  for (const status of ["SYNCED", "PENDING", "FAILED"]) {
    for (const isHost of [false, true]) {
      const html = renderToStaticMarkup(createElement(calendarSyncStatus, {
        eventId: fixture.event.id, status, isHost,
      }));
      if (isHost) {
        assert.match(html, /Bare synlig for arrangører/);
        assert.match(html, /Kalenderen er oppdatert|Outlook-kalenderen/);
      } else {
        assert.equal(html, "");
      }
    }
  }
  const event = { ...fixture.event, inviteMode: "SHARED", calendarSyncStatus: "SYNCED" };
  assert.doesNotMatch(renderDetails(festivals.fagfest, { event }), /Kalenderen er oppdatert|Bare synlig/);
  assert.match(renderDetails(festivals.fagfest, {
    event, user: { ...user, email: "host@fixture" },
  }), /Kalenderen er oppdatert/);
});

test("room booking status is host-only while the room name remains visible", () => {
  for (const status of ["PENDING", "ACCEPTED", "DECLINED"]) {
    for (const isHost of [false, true]) {
      const html = renderToStaticMarkup(createElement(eventDescription, {
        ...fixture,
        event: { ...fixture.event, roomName: "Speakers Corner", roomStatus: status },
        user: { ...user, email: isHost ? "host@fixture" : user.email },
        displayTime: true,
        invitationCapacity: { reservedInvitations: 0, hasOwnReservation: false },
        features: { roomBooking: true },
      }));
      assert.match(html, /Speakers Corner/);
      const privateText = /Bare synlig for arrangører|Venter på svar fra rommet|Rom booket|Rommet avslo bookingen|Velg et annet rom/;
      if (isHost) assert.match(html, privateText);
      else assert.doesNotMatch(html, privateText);
    }
  }
});

test("rendered festival details preserve committee, label and individual host contacts", () => {
  for (const festival of Object.values(festivals)) {
    const html = renderDetails(festival);
    const organizerHtml = renderToStaticMarkup(createElement(description, {
      ...fixture, contact: festival.contact, user, displayTime: true,
      invitationCapacity: { reservedInvitations: 1, hasOwnReservation: false },
    }));
    assert.equal(html.match(new RegExp(`data-copy-url="https://fixture.example/${festival.slug}/fixture-event"`, "g"))?.length, 2);
    if (festival.contact.kind === "committee") {
      assert.ok(organizerHtml.includes(`href="mailto:${festival.contact.email}"`));
      assert.ok(organizerHtml.includes(festival.contact.label));
    } else if (festival.contact.kind === "label") {
      assert.match(organizerHtml, />IPS<\/li>/);
      assert.doesNotMatch(organizerHtml, /href="mailto:/);
    } else {
      assert.match(organizerHtml, /href="mailto:host@fixture"/);
      assert.match(organizerHtml, /data-umami-event="kontaker arrangør"/);
      assert.match(organizerHtml, /Host Person/);
    }
    assert.doesNotMatch(html, /\/edit|Dupliser|Slett arrangement/);
  }
});

test("shared details retain host, registration, deadline, capacity and reservation states", () => {
  assert.match(renderDetails(festivals.fagfest), />Bli med<\/span><\/button>/);
  assert.match(renderDetails(festivals.fagfest, { user: { ...user, email: "joined@fixture" } }), />Meld av<\/span><\/button>/);
  const hostHtml = renderDetails(festivals.fagfest, { user: { ...user, email: "host@fixture" } });
  assert.match(hostHtml, /href="\/event\/fixture-event\/admin"/);
  assert.match(hostHtml, /Administrer/);
  const fullEvent = { ...fixture.event, participantLimit: 3 };
  assert.match(renderDetails(festivals.fagfest, { event: fullEvent }), /Arrangementet er fullt/);
  assert.match(renderDetails(festivals.fagfest, {
    event: fullEvent, invitationCapacity: { reservedInvitations: 1, hasOwnReservation: true },
  }), />Bli med<\/span><\/button>/);
  assert.match(renderDetails(festivals.fagfest, {
    event: { ...fixture.event, signupDeadline: "2000-01-01T12:00:00" },
  }), /Påmeldingsfristen er utløpt/);
  assert.match(renderDetails(festivals.fagfest, {
    user: { ...user, email: "joined@fixture" },
    event: { ...fixture.event, endTime: "2000-01-01T12:00:00" },
  }), />Slett deltakelse<\/span><\/button>/);
});

test("shared server page authenticates before scoped reads and preserves capacity and host-only errors", async () => {
  for (const festival of Object.values(festivals)) {
    const calls = [];
    let currentUser = user;
    const page = loadComponent("./festivalEventPage.tsx", {
      ...commonMocks,
      "server-only": {},
      "@/auth/token": {
        checkToken: async (path) => { calls.push(["auth", path]); },
        getUser: async () => currentUser,
      },
      "@/service/eventQueries": {
        getEvent: async (id, path) => { calls.push(["read", id, path]); return fixture; },
      },
      "@/service/eventListTransport": { ApiError },
      "@/components/cardWithBackground": { default: noopComponent },
      "./eventDetails": { default: details },
    });
    const props = { festival, params: Promise.resolve({ id: fixture.event.id }) };
    const element = await page.default(props);
    assert.deepEqual(calls, [
      ["auth", `/${festival.slug}/fixture-event`],
      ["read", fixture.event.id, `/${festival.slug}/fixture-event`],
    ]);
    assert.equal(element.props.className, `w-full ${festival.bgClass} pb-10`);
    const card = element.props.children;
    assert.equal(card.props.backLink, `/${festival.slug}`);
    assert.equal(card.props.backToOverview, true);
    assert.equal(card.props.titleColor, festival.titleColor);
    assert.equal(card.props.backText, festival.backText);
    assert.deepEqual(card.props.children.props.invitationCapacity, { reservedInvitations: 1, hasOwnReservation: false });
    assert.equal(card.props.children.props.calendarSyncError, null);
    currentUser = { ...user, email: "HOST@fixture" };
    const hostElement = await page.default(props);
    assert.equal(hostElement.props.children.props.children.props.calendarSyncError, fixture.calendarSyncError);
    assert.deepEqual(await page.generateFestivalMetadata(festival, props), { title: "Fixture Δ Delta" });
  }
});

test("metadata handles sanitized API errors but preserves auth and not-found control flow", async () => {
  let failure = new ApiError("arrangementet", 503);
  const page = loadComponent("./festivalEventPage.tsx", {
    ...commonMocks, "server-only": {}, "@/auth/token": {},
    "@/service/eventQueries": { getEvent: async () => { throw failure; } },
    "@/service/eventListTransport": { ApiError },
    "@/components/cardWithBackground": { default: noopComponent },
    "./eventDetails": { default: details },
  });
  const props = { params: Promise.resolve({ id: fixture.event.id }) };
  assert.deepEqual(await page.generateFestivalMetadata(festivals.mim, props), { title: "Delta Δ" });
  for (const message of ["NEXT_REDIRECT", "NEXT_HTTP_ERROR_FALLBACK;404", "Unexpected error"]) {
    failure = new Error(message);
    await assert.rejects(page.generateFestivalMetadata(festivals.mim, props), (error) => error === failure);
  }
});
