# Project Working Rules

## Backend Ownership
- Next.js is the only application runtime.
- Supabase is used only as PostgreSQL infrastructure.
- Do not add business logic to Supabase functions, triggers, or auth flows.
- Prefer Route Handlers, Server Components, and Server Actions in Next.js.

## Auth Standard
- Authentication is server-owned.
- The source of truth for auth is the server session, never Redux or localStorage.
- Use exactly one session cookie: `mc_session`.
- The cookie must stay `httpOnly`, `sameSite=lax`, `secure` in production, and path `/`.
- Session lookup, refresh, invalidation, and authorization must go through `src/lib/auth/session.ts`.
- Protected routes must be enforced in server layouts or server helpers, not only in client components.
- Client state may mirror auth for UI rendering, but must never become authoritative.

## Dev Admin
- Technical auth tooling lives under `/dev`.
- Dev admin access must be protected by environment credentials and its own server cookie flow.
- Dev tooling may manage auth test data, but must not become the production auth path.

## Session Lifecycle
- Use opaque random session tokens.
- Store only the token hash in the database.
- Invalidate prior active sessions on new login unless requirements explicitly change.
- Track absolute expiry and idle expiry separately.
- Throttle session touch writes to avoid unnecessary latency and database churn.

## Data Access
- Use Prisma through `src/lib/prisma.ts`.
- Keep auth identity/credentials/session tables separated from domain profile data.
- Prefer small server utilities with clear names over large generic abstractions.

## Architecture Contracts
- This typing strategy is the default and should be reused for all new implementations unless the project architecture changes substantially.
- Canonical source of shared primitives: `src/types/system.ts`.
- Canonical source of domain types, unions, and runtime guards: `src/types/index.ts`.
- Canonical source of auth/session boundary normalization: `src/lib/auth/session.ts`.
- Canonical source of permissionable features, operations, indexable auth metadata, and built-in profile grants: `src/lib/auth/authorization-catalog.ts`.
- Canonical source of derived permission profiles and permission definitions: `src/lib/auth/permission-profiles.ts`.
- Canonical source of semantic auth helpers: `src/lib/auth/authorization.ts`.
- Canonical source of semantic server auth guards: `src/lib/auth/authorization-guards.ts`.
- Canonical source of hydrated client auth UI state: `src/components/ui/AuthProvider.tsx`.
- Canonical source of Prisma client lifecycle: `src/lib/prisma.ts`.
- Canonical source of mock/demo entity creation: `src/lib/demo/factories.ts`.
- Canonical source of mock/demo data access: `src/lib/demo/queries.ts`.
- When implementing something new, follow this order:
- 1. Add or reuse base/shared types in `src/types/system.ts` if the pattern is cross-cutting.
- 2. Add or reuse domain unions, interfaces, constants, and guards in `src/types/index.ts`.
- 3. Normalize external input at the boundary before it reaches domain code.
- 4. Derive Prisma result types from query helpers, not inline payload casts.
- 5. Create explicit mappers when converting database records into domain models.
- 6. Use typed factories for mock/demo objects instead of `as Model`.
- If an AI or developer is unsure where the rule is implemented, inspect these files first: `src/types/system.ts`, `src/types/index.ts`, `src/lib/auth/session.ts`, `src/lib/prisma.ts`, `src/lib/demo/factories.ts`.

## Type System
- `strict` and `noImplicitAny` are mandatory and must stay enabled.
- Do not introduce `any`, `as any`, or cast-driven escapes to silence the compiler.
- Reuse shared utility types from `src/types/system.ts` via `src/types/index.ts`.
- Prefer the shared patterns first: `Nullable<T>`, `Optional<T>`, `ApiResult<T, E>`, `AppAsyncState`, `EntityId`, `ISODateString`, `JsonObject`.
- If a type crosses layers, export a named type instead of repeating inline object literals.
- If UI code needs a slice state type, export that interface from the slice file rather than weakening the selector.
- For Prisma-to-app transformations, create explicit mapper functions instead of unsafe casts.
- In app code, prefer deriving Prisma result types from query helpers with `Awaited<ReturnType<typeof queryFn>>[number]` instead of `Prisma.ModelGetPayload` inside pages/components.
- For domain unions, export runtime constants and guards from `src/types/index.ts` and use them instead of casting raw strings from forms, params, or the database.
- Normalize external or persistence-layer values at the boundary: route handlers, server actions, Prisma mappers, and form handlers.
- For mock/demo creation, use typed factory functions instead of object literals with `as Model`.
- Keep three layers distinct: database record types, app domain types, and UI/form draft types. Do not reuse one as a shortcut for another.
- If a reusable type pattern appears twice, promote it to `src/types/system.ts`.

## Frontend Alignment
- Client components should consume hydrated auth state from `src/components/ui/AuthProvider.tsx`, not create it.
- Redirect and role enforcement belong on the server first, UI second.
- Avoid duplicated auth logic across pages and layouts.

## Version Discipline
- Never assume package versions.
- Read `package.json` and validate compatibility before changing framework-specific syntax or APIs.

## Current Project Snapshot
- `src/app`
  - App Router entrypoints only: routes, layouts, loading boundaries, and API handlers.
  - Authenticated app sections now live under `src/app/(authenticated)` so the shell and route loading stay shared without changing public URLs.
  - `page.tsx` files should stay thin and delegate to `src/features/.../screens`.
  - Current explicit exception: `src/app/dev/auth-admin/page.tsx`, because it is technical tooling and still owns server orchestration directly.
- `src/features`
  - Current feature roots: `admin`, `auth`, `checklists`, `dashboard`, `dev-auth`, `executions`, `findings`, `machines`, `navigation`, `shell`.
  - Each feature owns its `screens`, domain UI, and light composition helpers.
- `src/components`
  - Shared primitives only.
  - Current shared groups: `dev`, `display`, `feedback`, `navigation`, `screen`, `ui`.
- `src/lib`
  - Infrastructure and boundaries: auth, Prisma, mock/demo data access, normalization.
- `src/components/ui/AuthProvider.tsx`
  - Minimal client auth mirror for UI rendering.
  - Keep drafts and per-screen interaction state local to the screen.

## Current Frontend Rules
- Canonical architecture guide: `docs/frontend-architecture.md`
- Canonical routing guide: `docs/frontend-routing.md`
- Canonical loading/pending UX guide: `docs/loading-pattern.md`
- Canonical authorization guide: `docs/authorization-pattern.md`
- Canonical permission taxonomy guide: `docs/permission-taxonomy.md`
- Canonical route contract: `src/features/navigation/routes.ts`
- Canonical authz feature catalog for front visibility propagation: `src/lib/auth/authorization-catalog.ts`
- Canonical indexed navigation registry: `src/features/navigation/views.ts` (derived from the authz catalog)
- Canonical mock/demo data boundary: `src/lib/demo/queries.ts`
- Canonical reusable route skeleton primitives: `src/components/feedback/LoadingSkeleton.tsx`
- Canonical route skeleton orchestrator: `src/components/feedback/RouteLoadingScreen.tsx`
- Canonical persistent navigation link primitive: `src/features/navigation/components/TrackedLink.tsx`
- Canonical shared shell route boundary: `src/app/(authenticated)/layout.tsx`
- Canonical shell-aware route loading boundary: `src/app/(authenticated)/loading.tsx`
- Do not place domain cards, filters, or feature-specific status maps in `src/app`.
- In front screens, derive permission capabilities once at the top from `src/lib/auth/authorization.ts` and render from that snapshot.
- Buttons that only toggle local UI should stay as plain buttons without loading treatment.
- For immediate navigation with no desired pending feedback, prefer plain `Link` outside persistent navigation surfaces, or `TrackedLink` with `trackNavigation={false}` when that primitive is required by the surface.

## Current Product State
- Auth is real and server-owned through Prisma.
- Login normal y login dev ahora usan server actions con redirect server-owned.
- La lectura de sesion en render es read-only; la mutacion de sesion vive en route handlers o server actions.
- Redux ya no forma parte del runtime del front.
- El espejo cliente de auth vive en `src/components/ui/AuthProvider.tsx`.
- Los drafts interactivos grandes viven locales en sus screens, no en store global.
- Authorization now resolves permission profiles from the server session.
- El feedback de carga visible esta centrado en controles locales (`AsyncButton`, `FormSubmitButton`, `TrackedLink`) y `loading.tsx`; la barra global superior ya no esta montada.
- Las vistas autenticadas comparten `src/app/(authenticated)/layout.tsx`, por lo que el sidebar persiste y `src/app/(authenticated)/loading.tsx` carga solo el area de contenido.
- Route loading now prefers skeleton variants (`auth`, `workspace`, `dashboard`, `list`, `detail`, `editor`) over centered generic spinners.
- Permission profiles now also persist in Prisma:
  - `Permission`
  - `PermissionProfile`
  - `PermissionProfilePermission`
  - `Profile.permissionProfileId`
- Prisma now has a versioned baseline migration under `prisma/migrations`.
- `Profile.role` remains as compatibility input, not the preferred source of truth for new authorization code.
- First built-in permission profiles:
  - `operator_basic`
  - `supervisor_operations`
  - `admin_system`
- Dev admin tooling is real and isolated under `/dev`.
- Most business/domain screens are still mock-backed through `src/lib/demo/queries.ts`.
- Current placeholder routes still intentionally backed by `RoutePlaceholder`:
  - machine create
  - machine edit
  - checklist create
  - execution create
  - finding detail
- Current detail/edit screens that exist as real UI but are still mock-backed:
  - machine detail
  - checklist edit
  - execution detail

## Current Tooling Gates
- Use these as the current non-interactive gates:
  - `npm run verify`
  - `npm run verify:full`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:ui`
  - `npm run build`
  - `npx prisma validate`
  - `npx prisma generate`
  - `npm run prisma:migrate:status`
  - `npm run prisma:sync-authz`
- Preferred day-to-day contract:
  - fast check: `npm run verify`
  - release-grade check: `npm run verify:full`
- Do not treat `npx tsc --noEmit` as the canonical local gate for this repo.
  - Route-aware `.next/types` are generated by Next and can make raw `tsc` order-dependent.
  - The stable project gate is `npm run typecheck`, backed by `tsconfig.typecheck.json`.
- `npm run lint` is now a stable gate.
  - It runs `eslint` directly with project rules and local guardrails.
  - Treat lint failures as contract failures, not style suggestions.
- `npm run build` intentionally skips linting.
  - The canonical lint contract runs in `npm run verify` and `npm run verify:full`.
  - This avoids Next's incomplete build-time lint pass, which cannot load the repo's local custom ESLint rules.
- Local Git hooks are prepared in `.githooks`.
  - `pre-commit` runs `npm run lint`
  - `pre-push` runs `npm run verify`
  - activate them with `npm run hooks:install`
  - if no `.git` directory exists yet, the installer leaves the hook files ready and exits without failing

## Current Prisma And Env Workflow
- Prisma CLI is aligned through `prisma.config.ts`.
- Prisma Migrate is now the preferred path for structural schema changes.
- Existing schema state is baselined in `prisma/migrations`.
- `syncAuthorizationCatalog` is maintenance/bootstrap work.
  - Run it from scripts, explicit repair flows, or controlled setup paths.
  - Do not call it from read routes or routine CRUD forms.
- Authorization catalog sync is available through:
  - `src/lib/auth/sync-authorization-catalog.ts` inside app/runtime code
  - `npm run prisma:sync-authz` for local CLI seeding/backfill
  - `npm run prisma:sync-authz` now reads the same TypeScript authz catalog used by the app
- Local active env file is `.env.local`.
- Keep `.env.local.example` updated whenever a new required variable is introduced.
- Do not silently introduce a second active env source without updating this file and the docs.

## Current Auth Runtime Notes
- `getCurrentSession()` es la lectura segura para render/layouts/server components.
- `getCurrentSessionWithRefresh()` es la variante mutable para route handlers cuando se necesita tocar idle expiry y limpiar cookies invalidas.
- `getInitialAuthState()` arma el snapshot server->client para `AuthProvider`.
- No reintroducir `cookies().set()` o `cookies().delete()` dentro de layouts, pages server o helpers de render.
- `/api/auth/session` es el endpoint mutable de session touch para el shell autenticado.

## Current Guardrails
- `tests/app-views.test.ts` enforces:
  - route template alignment with `src/app`
  - route group folders do not drift the audited public URL contract
  - thin route entrypoints delegating to feature screens
  - navigation registry consistency
- ESLint currently enforces:
  - thin `src/app/**/page.tsx` entrypoints delegating to feature screens
  - no inline app route strings in navigation-aware code when `ROUTE_PATHS` should be used
  - `FormSubmitButton` in forms backed by server actions
  - no `next/link` in persistent navigation surfaces outside `TrackedLink`
- If route structure, screen delegation rules, or navigation registration change, update:
  - `AGENTS.md`
  - `docs/frontend-architecture.md`
  - `docs/frontend-routing.md`
  - `tests/app-views.test.ts`

## Agent Working Pattern
- Always read `AGENTS.md` before starting an implementation.
- Always re-read `AGENTS.md` after finishing an implementation.
- If the implementation changed structure, workflow, guardrails, tooling, or the recommended working pattern:
  - update `AGENTS.md`
  - update the affected docs
  - leave the project in a better state for the next agent
- Use a short "feedback reverb" after each meaningful change:
  - what changed
  - what rule or pattern this reinforces
  - what future agent should assume now
- Before considering work complete, run:
  - `npm run verify`
  - or `npm run verify:full` when the change is structural, risky, or release-facing
- Before adding a new screen, inspect:
  - `src/features/<domain>/screens`
  - `src/features/navigation/routes.ts`
  - `docs/frontend-architecture.md`
- Before adding async button behavior, inspect:
  - `docs/loading-pattern.md`
  - `src/components/feedback`
  - `src/hooks/useAsyncAction.ts`
- Before adding or changing auth behavior, inspect:
  - `src/lib/auth/authorization-catalog.ts`
  - `src/lib/auth/session.ts`
  - `src/lib/auth/permission-profiles.ts`
  - `src/lib/auth/authorization.ts`
  - `src/lib/auth/authorization-guards.ts`
  - `src/lib/auth/shell.tsx`
  - `src/lib/auth/dev-admin.ts`
- When the project structure changes, refresh this snapshot instead of leaving AGENTS.md purely generic.
