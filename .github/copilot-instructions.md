# Copilot Instructions – delta-frontend

## Commands

```bash
npm run dev      # Start dev server (backend expected at http://localhost:8080)
npm run build    # Production build (standalone Docker output)
npm run lint     # ESLint check
```

No test suite is configured.

## Architecture

**delta-frontend** is a Next.js App Router application (Next.js 16, React 19, TypeScript strict) that serves as the frontend for the Delta event system at NAV. It talks to a backend service (`delta-backend`) via an Axios client that injects Azure AD OBO tokens.

### Layer breakdown

| Layer | Location | Pattern |
|---|---|---|
| Pages (Server Components) | `src/app/**/page.tsx` | Async, fetch data directly via server actions |
| Server Actions | `src/service/` | `"use server"` functions — all mutations and reads go here |
| API client | `src/api/instance.ts` | Axios factory; injects OBO token per request |
| Auth | `src/auth/token.ts` | Azure AD + `@navikt/oasis`; call `checkToken()` at the top of protected pages |
| UI Components | `src/components/` | Client Components (`"use client"`); receive props from server pages |
| Types | `src/types/` | Shared TypeScript types (`event.ts`, `user.ts`) |

Data flows **down only**: server pages fetch → pass props to client components. There is no global state library (no Redux, no Zustand, no Context for app state).

## Key conventions

### Imports
Always use the `@/` path alias (maps to `src/`). No relative imports like `../../`.

```typescript
import { checkToken } from "@/auth/token";
import { getEvent } from "@/service/eventActions";
```

### Server vs Client split
- `src/app/**/page.tsx` — async Server Components; call `checkToken()` first, then fetch data
- `src/components/*.tsx` — Client Components with `"use client"` at the top
- `src/service/*.ts` — Server Actions with `"use server"` at the top

### Protecting a route
Call `checkToken()` at the very start of any `page.tsx` that requires authentication:

```typescript
export default async function MyPage() {
  await checkToken();
  const data = await getSomeData();
  // ...
}
```

### Forms
All forms use **react-hook-form** + **zod**. Define a `z.object()` schema, infer the TypeScript type from it, and wire up `zodResolver`:

```typescript
const mySchema = z.object({ title: z.string().nonempty({ message: "Påkrevd" }) });
type MySchema = z.infer<typeof mySchema>;

const { register, handleSubmit, formState: { errors } } = useForm<MySchema>({
  resolver: zodResolver(mySchema),
});
```

### UI components
Use **NAV Aksel** (`@navikt/ds-react`) for all UI elements. Tailwind utilities (with the NAV `@navikt/ds-tailwind` preset) handle layout and spacing. Tailwind preflight is disabled to avoid conflicts with Aksel's CSS reset.

Aksel's token-based class names follow this pattern: `text-ax-text-neutral`, `border-ax-border-accent`, `bg-ax-bg-neutral-soft`.

### Language
All user-facing strings are in **Norwegian Bokmål**. Keep it consistent.

### Caching
Use `unstable_cache` for server action results when appropriate. Events use a 60-second revalidation window (`SHARED_EVENT_LIST_REVALIDATE_SECONDS = 60`). Event detail pages set `Cache-Control: no-store` via `next.config.js`.

### Dynamic route params (Next.js 16)
`params` and `searchParams` are Promises in Next.js 16 — always `await` them:

```typescript
type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;
}
```

### Analytics
Track user interactions with Umami `data-umami-event` attributes — do not add `onClick` handlers just for analytics.

```tsx
<Button data-umami-event="Opprett arrangement klikket">Opprett</Button>
```

## Auth in development

`NODE_ENV=development` bypasses token validation. `getUser()` returns a hardcoded dev user (`dev@localhost`). The backend is expected at `http://localhost:8080`. Set `NEXT_PUBLIC_CLUSTER=dev` for dev-mode API routing.

## Environment variables

| Variable | Purpose |
|---|---|
| `FAGGRUPPE_ADMIN_GROUP_ID` | Azure AD group UUID that grants faggruppe admin access |
| `NEXT_PUBLIC_CLUSTER` | `prod` or `dev` — controls backend URL and token scope |
