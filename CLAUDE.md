# CLAUDE.md — Agent Operating Rules

Authoritative rules for any AI agent (Claude Code, Cursor, etc.) working in this repository.
These are **hard rules**: do not violate them without an explicit human instruction in the task.

> This is the canonical agent-guidance file. If an `AGENTS.md` exists, it must mirror this file.

---

## 1. Project

AMS — Apartment Management System. Multi-tenant: one platform hosts many **societies**, each fully
isolated. Backend is Express 4 + TypeScript (CommonJS, strict); Zod validation, Pino logging.

Monorepo layout — three siblings at the repo root:

| Folder    | What                                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| `server/` | Express + TypeScript API. All backend code, `drizzle/` migrations, `drizzle.config.ts`. |
| `web/`    | Next.js frontend.                                                                       |
| `shared/` | Types/schemas shared between `server/` and `web/` (`@shared/*`).                        |

`server/` and `web/` are independent npm packages (each has its own `package.json` and lockfile) — run
their scripts with `--prefix server` / `--prefix web` from the repo root, or `cd` into the folder first.
Root-level tooling (Prettier, husky, commitlint, lint-staged) lives in the root `package.json`.

## 2. Commands

All commands below run inside `server/` (or use `npm run <script> --prefix server` from the root).

| Task         | Command             |
| ------------ | ------------------- |
| Dev server   | `npm run dev`       |
| Type check   | `npm run typecheck` |
| Build        | `npm run build`     |
| Start (prod) | `npm start`         |

Formatting is repo-wide from the root: `npm run format` / `npm run lint` (Prettier).

There is **no test runner** configured. Do not invent one or assume `npm test` works. If verification
is needed, use `npm run typecheck` (in `server/`) + a throwaway `npx tsx` snippet (not committed).

---

## 3. Hard rules — code

1. **TypeScript strict, no escape hatches.** No `any`, no `@ts-ignore`, no non-null `!` to silence the
   compiler. `npm run typecheck` MUST pass before every commit.
2. **Env access only through the config module.** Read configuration from `@/config` only. Never touch
   `process.env` anywhere else. New env vars are added to the Zod schema in `src/config/config.ts`.
3. **Path alias.** Import internal modules via `@/*` (→ `src/`), never long relative `../../` chains.
4. **HTTP responses go through the response helper.** Controllers return data via `sendSuccess` /
   `sendError` from `@/utils/ApiResponse`. Do not hand-build `res.json(...)` envelopes.
5. **Errors are thrown, not returned.** Throw `ApiError.*` (`badRequest`, `unauthorized`, `forbidden`,
   `notFound`, `conflict`, `internal`) from `@/utils/ApiError`. The global `errorHandler` formats them.
   Never throw raw `Error` for API failures, never `res.status(...).json(...)` an error inline.
6. **Async controllers wrapped in `asyncHandler`** (`@/utils/asyncHandler`) so rejections reach the
   error handler. Never write a bare `async (req, res) => {}` route handler.
7. **Validate input with Zod + the `validate` middleware** (`@/middlewares/validate`). No manual
   request parsing in controllers.
8. **Use `StatusCodes`** from `http-status-codes` — never magic numbers like `403`.
9. **No decorators.** `experimentalDecorators` is off. Route guards are middleware factories
   (e.g. `validate(schema)`), not decorators. Do not enable decorators without explicit approval.
10. **Layered module shape.** A feature lives in `src/module/<name>/` split as
    `*.routes.ts → *.controller.ts → *.service.ts → *.schema.ts → *.types.ts`. Controllers stay thin;
    business logic lives in services. Services are exported as singletons (e.g. `export const xService = new XService()`).
11. **File naming:** dotted/kebab descriptors (`role-template.ts`, `item.controller.ts`). Classes/types
    PascalCase, functions/vars camelCase. Honor `.prettierrc.json` (single quotes, semicolons, 100 cols,
    2 spaces); run `npm run format`.

## 4. Hard rules — database

PostgreSQL via **Drizzle ORM**. Schema lives in `src/db/schema/` (one file per table + `relations.ts` +
an `index.ts` barrel); the connection is `db` from `@/db/client`.

1. **Schema is the source of truth.** Define tables in `src/db/schema/`, then generate migrations with
   `npm run db:generate`. Never write application tables by hand-editing SQL.
2. **Migrations are generated, append-only.** Never edit a migration that has already been applied;
   create a new one. Generated SQL in `drizzle/` is reviewed, not authored by hand.
3. **DB identifiers are `snake_case`; Drizzle TS symbols are `camelCase`.** Tables use UUID PKs
   (`defaultRandom()`) and `timestamptz` for all time columns.
4. **Permissions are never a table.** A role's permissions are rows in `role_permissions` storing the
   code permission _string_; there is **no** FK to the registry. Validate every permission against
   `isValidPermission()` (from `@/module/rbac`) before insert.
5. **Society scoping is structural.** Roles carry `society_id`; `user_roles` derives society through the
   role (never denormalize it). Reads/writes that touch tenant data are always society-scoped.
6. **Sessions store only a hashed token** (`token_hash`, SHA-256) — never persist a raw session token.
   Sessions hold identity only; the active society is per-request (`X-Society-Token`), never stored.
7. **The DB client uses `@/config`.** `src/db/client.ts` reads `config.database.url`. The one exception
   is `drizzle.config.ts` (CLI tooling), which reads `process.env.DATABASE_URL` via dotenv.

## 5. Hard rules — RBAC (read before touching auth/permissions)

The RBAC model has three layers: **Permissions** (code) → **Roles** (DB, society-scoped) →
**Assignments** (DB, user+society). See `src/module/rbac/`.

1. **Permissions live in code only — never in the database.** The single source of truth is the frozen
   registry in `src/module/rbac/permission.registry.ts`. Only a developer editing that file may add or
   change a permission. It is immutable at runtime.
2. **Never use raw permission strings.** Reference permissions through the typed `Permission` accessor
   (e.g. `Permission.BillingGenerate`), never the literal `'billing.generate'`.
3. **Never branch on role names in business logic.** No `if (role === 'treasurer')`. Always check a
   _permission_, never a role.
4. **Deny by default.** A route/action is inaccessible unless it explicitly declares a required
   permission. Adding a permission to the registry grants it to nobody until a role includes it.
5. **Roles are always society-scoped.** Every role and every check carries a `societyId`. Never make a
   role global. Zero data bleed between societies.
6. **Effective permissions = union of all the user's roles in the current society.** Any role granting
   the permission ⇒ allowed.
7. **No privilege escalation.** A user can only grant/assign permissions they themselves hold
   (`super_admin` excepted). Never let a role be granted a permission its creator lacks.
8. **Three-step check order:** authenticate (401) → permission (403) → ownership-conflict for sensitive
   resources, e.g. self-approval of one's own bill (403). Preserve this order.
9. **`super_admin`** is a platform-level sentinel (all permissions, not society-scoped) and is never
   seeded as a society role row. Do not make it editable/deletable.

## 6. Hard rules — UI

1. **Tailwind CSS only.** All styling goes through Tailwind utility classes. No plain CSS files,
   CSS-in-JS, or inline `style={}` objects unless Tailwind genuinely cannot express it.
2. **shadcn/ui first.** Before writing any component, check if shadcn/ui already provides it. Use the
   shadcn CLI to add it rather than hand-rolling. If an existing shadcn component can be tweaked
   (variant, className override, composition) to fit the need, do that instead of writing a new one.
3. **Build from scratch only as a last resort.** Only write a component from scratch when no shadcn/ui
   primitive exists and none can reasonably be composed/tweaked to fit.
4. **Good React patterns.** Functional components + hooks, single-responsibility components, lift
   state only as far as needed, derive state instead of duplicating it, keep props typed and minimal.
   Avoid prop-drilling beyond 2-3 levels — use composition or context where appropriate.
5. **No comments.** Do not comment component code. Only add a comment when the _why_ is genuinely
   non-obvious (e.g. a workaround for a library bug); never comment what the code already says.

## 7. Hard rules — git

1. **Conventional Commits**, enforced by commitlint. `type(scope): subject` — types: `feat, fix, docs,
style, refactor, perf, test, build, ci, chore, revert`. Subject lowercase, no trailing period,
   ≤ 100 chars.
2. **Branch naming**, enforced by hook: `<type>/<short-description>` (e.g. `feat/rbac-permissions`), or
   `release/*` / `hotfix/*`. Never commit feature work directly to `main`.
3. **One logical change per commit.** Do not bundle unrelated changes. Do not stage the whole tree
   blindly — stage the files that belong to the change you are committing.
4. **Never bypass hooks.** No `--no-verify`. If commitlint/branch-check/typecheck fails, fix the cause.
5. **Commit or push only when asked.** Do not push or open PRs unprompted.

## 8. Never do

- Read `process.env` outside the config module.
- Use raw permission strings or role-name checks.
- Store permissions in the database.
- Add an `any`, `@ts-ignore`, or skip `typecheck` to "make it pass".
- Commit unrelated changes together or bypass git hooks.
- Add dependencies, enable decorators, or introduce a test framework without explicit approval.
