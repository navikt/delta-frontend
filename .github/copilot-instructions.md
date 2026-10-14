# Copilot Instructions — delta-frontend

Delta is NAV's internal event registration app. This is the Next.js frontend; the backend lives at [navikt/delta-backend](https://github.com/navikt/delta-backend) and must be running locally on `http://localhost:8080` before the frontend will work.

## Commands

```bash
npm run dev       # Start dev server (requires backend running)
npm run build     # Production build + type-check
npm run lint      # Biome (React/Next.js lint rules; no formatting)
npm test          # Contract tests with node --test
```

Use the existing `.test.mjs` contracts for query policy, URL state, festival filtering, form initialization and transport failures. Verify streaming, navigation, retry and scroll with a production build; development renders are not reliable request-count evidence.

> ⚠️ **Read `node_modules/next/dist/docs/` before writing Next.js code.** This project uses Next.js 16 — APIs and conventions may differ significantly from training data. Heed deprecation notices.

## Architecture

### Server / Client split
Pages in `src/app/` are **Server Components** by default. Auth, data fetching, and user resolution happen server-side, then data is passed as props to `"use client"` components for interactivity.

Typical pattern:
```
src/app/event/[id]/page.tsx        ← Server: checkToken(), getUser(), getEvent(), passes props
src/app/event/[id]/eventDetails.tsx ← Client ("use client"): useState, modals, mutations
```

### Auth (`src/auth/token.ts`)
- `checkToken()` — validates the NAV OAuth token; redirects to `/oauth2/login` if missing/invalid
- `getUser()` — extracts `{ firstName, lastName, email }` from the JWT
- `getDeltaBackendAccessToken()` — gets an OBO token scoped to the backend (cluster-aware: `prod-gcp` vs `dev-gcp`)
- Validation precedes claim decoding and backend access. It is deduplicated per render/request with React `cache`; OBO failures throw instead of making anonymous production requests.
- In `NODE_ENV === "development"` all auth functions return mock data or skip validation

### API layer
- `src/service/eventQueries.ts` contains authenticated, server-only event/category reads. `roomQueries.ts` contains page-load feature flags.
- `eventActions.ts` contains mutations. `eventInteractiveReads.ts` retains person search and post-registration refresh; `roomActions.ts` retains interactive room search and availability. These actions authenticate direct invocation.
- Initial list/form reads run in Server Components under Suspense, not client effects. `statsActions.ts` and `wrappedActions.ts` are server-only calculation modules despite their names.
- `getApi()` creates an Axios client with the OBO token and base URL (`localhost:8080` in dev, `http://delta-backend` in prod)
- Event/category query failures throw sanitized `ApiError` values. Empty success and outages are distinct. Results use Next's `catchError` and `retry()` while controls remain mounted.
- Event responses are caller-specific. Keep them request-time and uncached; React request-scoped deduplication is not a shared data cache.
- `overviewState.ts` defines shared nuqs parsers. Backend-driving filters navigate; title search and same-dataset festival slices are shallow. Public/joined mode crossings navigate in both directions. Preserve legacy URL spellings and `"1"` booleans.

### Data model
`FullDeltaEvent` is the primary response type:
```ts
{ event: DeltaEvent, participants: DeltaParticipant[], hosts: DeltaParticipant[], categories: Category[], recurringSeries?: RecurringSeriesSummary }
```
- `participantLimit === 0` means **no limit**
- `participants` and `hosts` are separate arrays; both count toward capacity checks
- Registration status is derived by checking `participants.some(p => p.email === userEmail)` — there is no boolean flag

### UI components
- **Design system**: `@navikt/ds-react` (Aksel) for all UI primitives (`Button`, `Tag`, `Detail`, `Heading`, etc.) and `@navikt/aksel-icons` for icons
- **Tailwind**: used for layout/spacing. Preflight is disabled — Aksel provides its own CSS reset. Use `ax-*` breakpoint prefixes (e.g. `ax-md:grid-cols-3`) from `@navikt/ds-tailwind` preset.
- **Forms**: `react-hook-form` + `zod` with `@hookform/resolvers/zod`. See `src/components/createEventForm.tsx` for the canonical pattern.

## Key conventions

- **`params` and `searchParams` are Promises** — always `await` them: `const { id } = await params`
- **Norwegian UI copy** — all user-facing strings are in Norwegian Bokmål
- **Admin checks**: use `isFaggruppeAdmin()` from `src/auth/token.ts`; host status is checked inline via `hosts.map(h => h.email).includes(user.email)`
- **Date formatting**: always use `date-fns` / `date-fns-tz` and the helpers in `src/service/format.ts`; times are stored as ISO 8601 strings
- **Browser-local visibility**: zone-less backend LocalDateTime values keep their browser timezone interpretation for joined expiry and list presentation. Resolve time-sensitive content after hydration over server-loaded data; use consistent unresolved placeholders during SSR/hydration.
- **Festival defaults**: derive the browser calendar from the server-supplied request instant. An implicit default may navigate once if its public/joined dataset differs; same-dataset correction stays shallow. Preserve explicit tabs (including default-valued tabs), search and unrelated URL parameters.
