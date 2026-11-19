// Minimal stand-in for delta-backend on :8080 so `next dev` (mock auth as dev@localhost) can render pages for a11y tests.
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_BACKEND_PORT ?? 8080);
const ME = { email: "dev@localhost", name: "Nordmann, Ola Kari" };
const OTHER = { email: "kari@nav.no", name: "Nordmann, Kari" };
const categories = [
  { id: 1, name: "kompetanse" },
  { id: 2, name: "sosialt" },
  { id: 3, name: "bedriftidrettslaget" },
  { id: 4, name: "fagtorsdag" },
  { id: 5, name: "universell utforming" },
];

const DESCRIPTION = `Velkommen til en fagdag om tilgjengelighet.

# Program

## Formiddag

- Introduksjon
- Testing med skjermleser

Les mer på [aksel.nav.no](https://aksel.nav.no).`;

function localIso(daysFromNow, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:00:00`;
}

function fullEvent(id, overrides, { participants = [], hosts = [OTHER], eventCategories = [categories[0]] } = {}) {
  return {
    event: {
      id,
      title: "Fagdag om universell utforming",
      description: DESCRIPTION,
      startTime: localIso(2, 9),
      endTime: localIso(2, 15),
      location: "Fyrstikkalléen 1",
      public: true,
      participantLimit: 0,
      waitlistEnabled: false,
      signupDeadline: localIso(1, 12),
      ...overrides,
    },
    participants,
    hosts,
    categories: eventCategories,
    invited: [],
  };
}

const SIGNUP_OPTIONS = [
  { id: "o-physical", label: "Fysisk", participantLimit: 30, waitlistEnabled: true, allocatedSeats: 1, waitlistCount: 0 },
  { id: "o-digital", label: "Digitalt", participantLimit: 0, waitlistEnabled: false, allocatedSeats: 0, waitlistCount: 0 },
];

const events = () => [
  fullEvent(
    "e-hosted",
    {
      title: "Arrangement jeg arrangerer",
      participantLimit: 10,
      roomName: "Møterom Glitre",
      roomEmail: "glitre@nav.no",
      roomStatus: "ACCEPTED",
      calendarSyncStatus: "FAILED",
    },
    { hosts: [ME], participants: [OTHER], eventCategories: [categories[0], categories[3], categories[4]] },
  ),
  fullEvent(
    "e-joined",
    { title: "Arrangement jeg er påmeldt", startTime: localIso(3, 10), endTime: localIso(3, 11) },
    { participants: [ME], eventCategories: [categories[1]] },
  ),
  fullEvent(
    "e-full",
    { title: "Fullt arrangement med venteliste", participantLimit: 1, waitlistEnabled: true, startTime: localIso(2, 12), endTime: localIso(2, 17) },
    { participants: [OTHER] },
  ),
  fullEvent(
    "e-options",
    { title: "Arrangement med påmeldingsalternativer", inviteMode: "SHARED", signupOptions: SIGNUP_OPTIONS },
    { participants: [{ ...OTHER, signupOptionId: "o-physical" }] },
  ),
  fullEvent(
    "e-options-hosted",
    { title: "Alternativer jeg arrangerer", inviteMode: "SHARED", signupOptions: SIGNUP_OPTIONS },
    { hosts: [ME], participants: [{ ...OTHER, signupOptionId: "o-physical" }] },
  ),
  fullEvent(
    "e-long-title",
    { title: "Opplæring for Arbeid og Velferd – grunnleggende personvern og trygg behandling av personopplysninger i Nav" },
  ),
];

const historicalEvents = () => {
  const year = new Date().getFullYear();
  return [
    ...Array.from({ length: 12 }, (_, index) => fullEvent(
      `e-history-${index + 1}`,
      {
        title: `Historisk arrangement ${index + 1}`,
        startTime: `${year - 1}-06-${String(index + 1).padStart(2, "0")}T09:00:00`,
        endTime: `${year - 1}-06-${String(index + 1).padStart(2, "0")}T11:00:00`,
      },
      { participants: [ME] },
    )),
    fullEvent(
      "e-history-private",
      {
        title: "Privat historisk tittel",
        public: false,
        startTime: `${year - 2}-06-01T09:00:00`,
        endTime: `${year - 2}-06-01T11:00:00`,
      },
      { participants: [ME] },
    ),
  ];
};

const faggrupper = [
  {
    id: "f1",
    navn: "Faggruppe for tilgjengelighet",
    undertittel: "Vi deler erfaringer om UU",
    beskrivelse: DESCRIPTION,
    malgruppe: "Alle utviklere",
    tidspunkt: "Annenhver torsdag",
    starttid: "14:00:00",
    sluttid: "15:00:00",
    eiere: [{ navn: "Kari Nordmann", epost: OTHER.email }],
  },
];

const routes = [
  [/^\/category$/, () => categories],
  [/^\/features$/, () => ({ roomBooking: true, teamsMeeting: true, sharedCalendar: true, peopleSearch: true, signupOptions: true })],
  [/^\/event$/, (_match, params) => [
    ...events(),
    ...(params.get("onlyJoined") === "true" ? historicalEvents() : []),
  ]],
  [/^\/event\/([\w-]+)$/, ([, id]) => events().find((item) => item.event.id === id)],
  [
    /^\/user\/event\/([\w-]+)\/waitlist$/,
    ([, id]) => ({ enabled: id === "e-full", count: 0, position: null, registered: false, open: id === "e-full" }),
  ],
  [/^\/admin\/event\/[\w-]+\/waitlist$/, () => []],
  [/^\/user\/waitlist$/, () => [{ event: events()[2].event, position: 1, open: true, hosts: events()[2].hosts }]],
  [/^\/api\/faggrupper$/, () => faggrupper],
  [/^\/api\/faggrupper\/([\w-]+)$/, ([, id]) => faggrupper.find((group) => group.id === id)],
  [/^\/api\/faggrupper\/[\w-]+\/eier$/, () => faggrupper[0].eiere],
];

createServer((request, response) => {
  const { pathname, searchParams } = new URL(request.url ?? "/", `http://localhost:${PORT}`);
  const route = request.method === "GET" && routes.find(([pattern]) => pattern.test(pathname));
  const body = route ? route[1](pathname.match(route[0]), searchParams) : undefined;
  if (body === undefined) {
    console.warn(`[mock-backend] 404 ${request.method} ${pathname}`);
    response.writeHead(404, { "Content-Type": "application/json" }).end(JSON.stringify({ title: "Not found" }));
    return;
  }
  response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(body));
}).listen(PORT, () => console.log(`[mock-backend] listening on http://localhost:${PORT}`));
