# Technical Improvements

## Data fetching — move from client to RSC
The current pattern fetches events in a client component `useEffect` via server functions (`getEvents`). This is anti-pattern in both React and Next.js. The target architecture:

- **Data fetching happens in Server Components** — `page.tsx` reads filters from URL params/searchParams (available server-side), fetches data, and streams it to the client via `<Suspense>` boundaries with skeleton fallbacks
- **Server Functions (`"use server"`) are only for mutations** — `joinEvent`, `leaveEvent`, `createEvent`, etc. Not for reads.
- **Filter components are pure client-side** — they manage UI state and update the URL. No data fetching. Consider [nuqs](https://nuqs.dev/) for type-safe URL state management instead of manual `useSearchParams`/`useState` sync.

Reference PR with proof-of-concept: https://github.com/navikt/delta-frontend/pull/32

## Caching
- Replace `unstable_cache` with the `use cache` directive (requires `cacheComponents: true` in `next.config.js`) — but only after migrating data fetching to RSC
- Add `revalidatePath`/`revalidateTag` in mutation server actions (`joinEvent`, `leaveEvent`) so the event list refreshes immediately
- Consider using `fetch` directly instead of Axios — Next.js extends `fetch` with built-in caching and revalidation

## Auth
- Defer token validation to the data-fetching step (RSC) rather than calling `checkToken()` as a separate step at the top of every page

## Dead code
- Remove `next/head` import and `<Head>` wrapper in `src/app/event/[id]/page.tsx` — metadata is already handled via `generateMetadata()`

## Festival route duplication
- Routes `/fagfest`, `/fagtorsdag`, `/fagdag_utvikling_og_data`, `/mim` each duplicate the full event detail flow (page, eventDetails, eventCard, participant, etc.)
- Consolidate into a shared component set parameterised by festival type/category

## API layer
- `eventActions.ts` mixes data fetching and mutations in a single `"use server"` file — separate queries (plain async functions, called from RSC) from actions (server functions for mutations)
