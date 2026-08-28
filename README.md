# AMS Backend

**Apartment Management System** — Multi-tenant backend for managing apartment societies and their members.

Express 4 + TypeScript (CommonJS, strict). PostgreSQL via Drizzle ORM. Zod validation. Pino logging.

## Overview

AMS is a **multi-tenant** platform: one deployment hosts many independent **societies**, each with complete data isolation. Every society has its own roles, permissions, users, and resources. The platform enforces RBAC (Role-Based Access Control) at every layer.

- **Isolation**: Society data is structurally scoped — no cross-tenant data bleed.
- **Permissions**: Code-first RBAC with a frozen permission registry, society-scoped roles, and user assignments.
- **Sessions**: Token-based auth with per-request society selection via `X-Society-Token` header.

## Project Structure

```
.
├── server/       # Backend (Express + TypeScript) — this README
│   ├── src/
│   ├── drizzle/  # Generated DB migrations
│   └── docs/
├── web/          # Next.js frontend — see web/README.md
└── shared/       # Types shared between server and web
```

The frontend lives in [`web/`](web/README.md) and talks to this API over HTTP. Run them side by side
for local development — this server runs on `PORT=9090`; the web app runs on port `9095` and its
`NEXT_PUBLIC_API_URL` defaults to `http://localhost:9090/api/v1`.

## Requirements

- Node.js 20+
- PostgreSQL 13+
- `.env` file with required variables (see `server/.env.example`)

## Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in DATABASE_URL and other vars
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed super admin account
npm run dev          # Start dev server
```

## Scripts

| Command               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Start in watch mode (tsx)                             |
| `npm run build`       | Compile TypeScript to `dist/`                         |
| `npm start`           | Run the compiled build (production)                   |
| `npm run typecheck`   | Type-check without emitting; **must pass before git** |
| `npm run db:generate` | Generate a new migration from schema changes          |
| `npm run db:migrate`  | Apply pending migrations to the database              |
| `npm run db:push`     | Push schema directly to DB (dev only)                 |
| `npm run db:studio`   | Open Drizzle Studio (visual DB browser)               |
| `npm run db:seed`     | Seed the super admin account                          |

**Note**: No test runner is configured. Use `npm run typecheck` for validation; create throwaway snippets with `npx tsx` as needed.

Repo-wide formatting (`npm run format` / `npm run lint`) is run from the **repo root**, not `server/`.

## Environment Variables

| Variable                  | Required | Default       | Description                                                                                              |
| ------------------------- | -------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`            | Yes      | —             | PostgreSQL connection URL                                                                                |
| `NODE_ENV`                | No       | `development` | `development`, `test`, or `production`                                                                   |
| `PORT`                    | No       | `3000`        | Server port (this repo runs it on `9090`)                                                                |
| `CORS_ORIGIN`             | No       | `*`           | Comma-separated allowed origins or `*`                                                                   |
| `SESSION_EXPIRES_IN_DAYS` | No       | `30`          | Session TTL in days                                                                                      |
| `LOG_LEVEL`               | No       | auto          | `fatal` `error` `warn` `info` `debug` `trace` `silent`; defaults to `info` in production, `debug` in dev |

All variables are loaded and validated via Zod at startup in `src/config/config.ts`. The server exits immediately if required vars are missing or invalid.

## API Reference

Full collection available on Postman:

[AMS Backend — Postman Workspace](https://www.postman.com/brucewayne-5403656/steverogersx-s-org/overview)

### Base URL

```
http://localhost:<PORT>/api/v1
```

### Auth

| Method | Endpoint         | Auth         | Description                              |
| ------ | ---------------- | ------------ | ---------------------------------------- |
| POST   | `/auth/register` | —            | Register a new user                      |
| POST   | `/auth/login`    | —            | Login; returns session token + societies |
| POST   | `/auth/logout`   | Bearer token | Revoke current session                   |
| GET    | `/auth/me`       | Bearer token | Get authenticated user's profile         |

### Societies

| Method | Endpoint                                     | Auth                       | Permission              |
| ------ | -------------------------------------------- | -------------------------- | ----------------------- |
| POST   | `/societies/createSociety`                   | Bearer + super_admin       | —                       |
| GET    | `/societies/getSocieties`                    | Bearer + super_admin       | —                       |
| GET    | `/societies/:societyId/getSociety`           | Bearer + `X-Society-Token` | `society.settings.view` |
| GET    | `/societies/:societyId/getMembers`           | Bearer + `X-Society-Token` | `residents.view`        |
| POST   | `/societies/:societyId/assignMember`         | Bearer + `X-Society-Token` | `roles.assign`          |
| DELETE | `/societies/:societyId/removeMember/:userId` | Bearer + `X-Society-Token` | `roles.revoke`          |

### Request Headers

| Header            | Required       | Description                                 |
| ----------------- | -------------- | ------------------------------------------- |
| `Authorization`   | Most routes    | `Bearer <session_token>`                    |
| `X-Society-Token` | Society routes | 64-char society token (from login response) |

### Response Envelope

Every endpoint returns:

```ts
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
  error: { message: string; code?: string; details?: unknown } | null;
  meta: { timestamp: string; [key: string]: unknown };
}
```

## Database Schema

PostgreSQL via Drizzle ORM. Schema source of truth is `src/db/schema/`.

| Table              | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| `users`            | Global user identities. `is_super_admin` is platform-level, not per-society. |
| `societies`        | Tenants. Each has a unique `token` used as the `X-Society-Token` header.     |
| `roles`            | Society-scoped roles. 8 system roles are seeded per society on creation.     |
| `role_permissions` | Stores permission strings per role. No FK to registry — validated in code.   |
| `user_roles`       | Maps users to roles. Society is derived through the role, never stored.      |
| `sessions`         | Session tokens stored as SHA-256 hashes. Raw token never persisted.          |

**Conventions**: UUID PKs (`defaultRandom()`), `timestamptz` for all time columns, `snake_case` DB identifiers, `camelCase` Drizzle symbols.

## Architecture

### Module Structure

Each feature lives in `src/module/<name>/`:

```
src/module/<name>/
  ├── <name>.routes.ts      # Express routes + middleware chain
  ├── <name>.controller.ts  # Thin HTTP handlers
  ├── <name>.service.ts     # Business logic (exported as singleton)
  ├── <name>.schema.ts      # Zod validation schemas
  └── <name>.types.ts       # TypeScript interfaces
```

### Middleware Stack

Applied in order in `app.ts`:

1. `helmet` — Security headers
2. `cors` — Cross-origin requests
3. `express.json()` / `express.urlencoded()` — Body parsing
4. `httpLogger` — Pino-based HTTP logging; generates/reuses `X-Request-Id`; redacts auth headers
5. Route handlers
6. `notFound` — Catches unmapped routes → `404`
7. `errorHandler` — Global error formatter (last)

**Route-level guards:**

- `authenticate` — Validates Bearer token, resolves `X-Society-Token`, loads effective permissions into `req.context`
- `requireSuperAdmin` — Enforces `req.context.isSuperAdmin`
- `requirePermission(...permissions)` — All listed permissions must be in `req.context.permissions`
- `validate(schema)` — Zod validation for `body`, `query`, `params`

### RBAC

Three layers:

1. **Permissions** — 44 typed constants in `src/module/rbac/permission.registry.ts`. Code-only; never in the database. Referenced as `Permission.BillingGenerate`, never as raw strings.
2. **Roles** — Rows in `roles`, always society-scoped. 8 system roles are auto-created per society: `society_admin`, `resident_owner`, `resident_tenant`, `treasurer`, `secretary`, `guard`, `security_supervisor`, `helpdesk_manager`.
3. **Assignments** — Rows in `user_roles`. Effective permissions = union of all the user's roles in the current society.

Permission domains: `visitor`, `billing`, `complaints`, `residents`, `notices`, `amenities`, `staff`, `roles`, `society`.

**Rules enforced:**

- Deny by default — a route is inaccessible unless it explicitly declares a permission.
- Never branch on role names in business logic — always check a permission.
- `super_admin` is a platform-level sentinel, not a society role.

### Error Handling

Errors are **thrown**, not returned. Use `ApiError.*` factory methods:

```ts
throw ApiError.badRequest('Invalid input'); // 400
throw ApiError.unauthorized('Missing token'); // 401
throw ApiError.forbidden('Insufficient perms'); // 403
throw ApiError.notFound('Resource not found'); // 404
throw ApiError.conflict('Duplicate entry'); // 409
throw ApiError.internal('Server error'); // 500
```

The global `errorHandler` middleware catches all thrown errors and formats them into the response envelope. Never call `res.status(...).json(...)` for errors inline.

## Default Credentials

A platform administrator is pre-seeded by `npm run db:seed` for local development:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@ams.local`      |
| Password | `Admin@123`            |
| Role     | Platform Administrator |

> This account is the software vendor operator. It can create societies but **cannot** access individual society data — enforced structurally, not by convention.

## Git Workflow

### Conventional Commits

```
type(scope): subject
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Rules: lowercase subject, no trailing period, ≤ 100 chars, one logical change per commit.

### Branch Naming

```
<type>/<short-description>
```

Examples: `feat/billing-module`, `fix/session-expiry`, `release/1.0.0`, `hotfix/critical-bug`

Never commit feature work directly to `main`.

### Pre-commit Checks

Hooks enforce branch name validation, commitlint message format, and `npm run typecheck`. **Never bypass with `--no-verify`.**

## Code Guidelines

- **No TypeScript escape hatches** — no `any`, no `@ts-ignore`, no non-null `!`.
- **Path alias** — use `@/*` for all internal imports; never `../../` chains.
- **Async controllers** — always wrapped in `asyncHandler`.
- **HTTP responses** — always via `sendSuccess` / `sendError` from `@/utils/ApiResponse`.
- **Config** — access only from `@/config`; never read `process.env` elsewhere.
- **Status codes** — use `StatusCodes` from `http-status-codes`; never magic numbers.
