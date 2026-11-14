# Astera

Study-management app for university students: they track programs, courses, assignments, exams and study time, and AI helps them plan (daily plans, study schedules, later notes, quizzes and flashcards). UI is in English.

## Stack

TanStack Start (React 19, SSR, file-based routing, server functions) · Drizzle + Postgres · Better Auth (email/password) · shadcn/ui on Base UI · Tailwind v4 · Jotai · Zod v4 · Biome · Bun.

## Commands

- `bun run dev` — dev server on :3000 (needs `docker compose up -d` for Postgres and a `.env`, see `.env.example`)
- `bun run check` — Biome lint + format with fixes
- `bun run typecheck` — TypeScript
- `bunx drizzle-kit generate` / `bunx drizzle-kit migrate` — migrations

Run `bun run check` and `bun run typecheck` before considering work done.

## Workflow

- Never commit or push. The owner reviews every change and is the only one who merges into `main`.
- Branches: `feat/…`, `fix/…`, `chore/…`, `refactor/…` (kebab-case), from `main`.
- Commit messages: Conventional Commits, English, imperative, e.g. `feat(dashboard): add workload chart`.
- No tests for now; the product is still being validated.
- Product and architecture decisions are made with the owner: propose options with a recommendation, don't decide alone.

## Code conventions

- Biome is the only linter/formatter. `src/components/ui/` is stock shadcn: edit only deliberately.
- Comments: English, minimal, only to explain a non-obvious *why*. No narration or leftover comments.
- File names in kebab-case, named exports, imports via `@/`.
- Feature components go in `src/components/<feature>/`.

### Data and server

- Server functions live in `src/server-funcs/<entity>.ts`, use `authMiddleware`, and read the user from `context.session` (don't call `ensureSession()` again).
- Every query enforces ownership: program data joins back to `programs.userId`; user-level tables with their own `userId` (e.g. `daily_plans`) filter on it directly.
- Input validation uses Zod schemas from `src/lib/validation.ts`.
- Drizzle `numeric` columns come back as strings: convert at the server-function boundary.
- Every schema change gets a migration in `src/db/migrations`.
- Store timestamps in UTC; compute "today" in the user's timezone.

### Data fetching

- Page data is loaded with TanStack Router/Start (`beforeLoad`/`loader` + server functions). After mutations, refresh with `router.invalidate()`.
- TanStack Query is only for client-driven parts (e.g. study-session timer, optimistic toggles, polling). Each piece of data has a single owner: don't load the same data through both a loader and a query.

## Domain decisions

- Grades are entered in the program's own scale (e.g. 0–10, 0–100, A–F) and stored normalized as 0–100. Letter grades map to a configurable percentage per program.
- Exams and assignments have an importance (1–5) used for prioritization.
- Weight (% of final grade) is optional and used only for grade calculation; without weights the course grade is a simple average. The UI must explain weights and show when a grade is an unweighted estimate.

## AI

- Vercel AI SDK, provider-agnostic. Default to Gemini Flash-Lite, a stronger Flash model for heavy tasks (schedules, quizzes).
- AI sits on top of the deterministic scoring engine (`server-funcs/daily-plan.ts`): the engine ranks, the AI plans and explains. Features must degrade gracefully if the AI call fails.
- Prefer structured output validated by Zod over parsing free text.

## App structure

- `/` landing · `/sign-in` · `/app/*` authenticated area (sidebar + main card).
- Planned pages: Dashboard, Planner (all deadlines across courses), Courses (list → course page with tabs), Study (sessions). New users without a program go to a dedicated onboarding page.
