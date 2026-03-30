# Copilot Instructions — delta-frontend

Delta is NAV's internal event registration app. This is the Next.js frontend; the backend lives at [navikt/delta-backend](https://github.com/navikt/delta-backend) and must be running locally on `http://localhost:8080` before the frontend will work.

## Commands

```bash
npm run dev       # Start dev server (requires backend running)
npm run build     # Production build + type-check
npm run lint      # ESLint
```

There are no automated tests.

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
- In `NODE_ENV === "development"` all auth functions return mock data or skip validation

### API layer (`src/api/instance.ts`, `src/service/eventActions.ts`)
- Backend calls live in `src/service/eventActions.ts` — currently marked `"use server"` for both reads and mutations (see `IMPROVEMENTS.md` for planned refactor)
- `getApi()` creates an Axios client with the OBO token and base URL (`localhost:8080` in dev, `http://delta-backend` in prod)
- Errors are wrapped in `ApiError`; `getEvents()` swallows errors and returns `[]` rather than throwing
- Refer to the Next.js docs at `node_modules/next/dist/docs/` for current caching best practices before changing caching logic

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
