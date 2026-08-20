# Machine Maintenance Checklists

> Checklist management for machine and equipment maintenance, built on Next.js and Prisma.

A checklist application for tracking maintenance on machines and equipment: define checklist
templates, run them against specific machines, and keep an auditable record of what was inspected,
by whom and when.

**Status:** Active · **Stack:** Next.js (App Router) + TypeScript + Prisma + PostgreSQL

## Quick start

```bash
npm install

cp .env.local.example .env.local     # set the Supabase / PostgreSQL connection

npx prisma migrate dev
npm run prisma:sync-authz

npm run dev
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run verify` | Lint + typecheck + unit tests, in parallel |
| `npm run lint` | ESLint with the project's custom rules |
| `npm run typecheck` | TypeScript via `tsconfig.typecheck.json` |
| `npm run test:ui` | UI and navigation integration tests |
| `npm run prisma:sync-authz` | Sync authorization rules into the database |

## Architecture

Feature-first layout — business logic is grouped by domain rather than by technical layer.

```
src/app/           Next.js App Router entrypoints; pages stay thin and delegate to screens
src/features/      Business logic and UI by domain (checklists, machines, …)
src/components/    Shared UI components and primitives
src/lib/           Infrastructure: Prisma, auth, data normalization
src/types/         System and domain type definitions
docs/              Extended documentation
```

The rule that holds this together: **pages stay thin**. A route file resolves params and renders a
screen from `src/features/`; it never holds business logic. That keeps each feature movable and
testable without dragging the router along with it.
