---
name: astera
description: Project context for Astera — load before any feature work. Surfaces domain vocabulary, key design decisions, and coding patterns specific to this codebase. Triggers on any mention of a domain entity (Program, Course, Term, Assignment, Exam, Study Session, Note, Daily Plan) or any new feature work.
---

# Astera Project Context

Load at the start of any feature work. Carries domain vocabulary, settled design decisions, and project-specific coding patterns not obvious from the code alone.

Full references: `GLOSSARY.md`, `docs/adr/`, `CLAUDE.md`.

## Domain vocabulary

Use exact terms. Challenge any code or comment that uses an avoided term.

| Use | Avoid |
|---|---|
| Program | Degree, workspace |
| Term | Semester, quarter, period |
| Course | Class, subject, module |
| Assignment | Task, deliverable |
| **Test** *(assignment type)* | **Quiz** ← reserved for Practice Quiz |
| Exam | Final, assessment |
| Score | Grade (overloaded), mark |
| Course Grade | Final grade |
| Weight | Percentage, contribution |
| Study Session | Session, focus block |
| Note | Document, annotation |
| Practice Quiz | Quiz, test |
| **Daily Plan** | **Recommendation, daily recommendation** |
| Priority Score | Score (overloaded) |
| Importance | Priority (that's the engine's output, not an input) |
| Course Difficulty | Complexity, level |

## Key design decisions

**Formal-first** — built for university students. Terms are nullable in the DB but required in the UI. Informal use (no terms, self-paced) is out of scope for now. → `docs/adr/0001`

**`test` not `quiz`** — the assignment type enum has `"test"`. There is no `"quiz"` assignment type. `quiz` is reserved for the M7 AI self-study tool (Practice Quiz). → `docs/adr/0002`

**`daily_plans` / `daily_plan_items`** — these are the DB table names. Never write `daily_recommendations` or `recommendation_items` in new code.

**Grades stored as 0–100** — all scores are stored internally as 0–100 regardless of the program's grading scale. Convert at display time only.

**Importance vs Weight** — `importance` (1–5) feeds the scoring engine for prioritisation. `weight` (0–100%) is an optional field used only for grade calculation. Never conflate them.

**AI sits on top of the engine** — `server-funcs/daily-plan.ts` computes Priority Scores. The AI schedules and explains on top of that output. AI features must degrade gracefully if the API call fails.

## Coding patterns

**Server functions**
- Always use `authMiddleware`; read the user from `context.session` — never call `ensureSession()` inside a handler
- Every query enforces ownership: program data joins back to `programs.userId`; user-level tables with their own `userId` (e.g. `daily_plans`) filter on it directly
- Drizzle `numeric` columns return strings; convert with `Number()` at the server-function boundary
- Files: `src/server-funcs/<entity>.ts`, schemas: `src/lib/validation.ts`

**Data fetching**
- Page data: `beforeLoad` / `loader` + server functions
- After mutations: `router.invalidate()` — not TanStack Query
- TanStack Query only for client-driven parts (timer, optimistic toggles, polling)
- Each piece of data has one owner — never load the same data through both a loader and a query

**Components**
- `src/components/ui/` is stock shadcn — edit deliberately
- Feature components: `src/components/<feature>/`
- File names: kebab-case; named exports; imports via `@/`

**Workflow**
- Never commit or push — the owner reviews and merges
- Run `bun run check` and `bun run typecheck` before calling work done
- Comments: English, minimal, only to explain a non-obvious *why*
