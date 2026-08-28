# AMS UI

Next.js (App Router) frontend for the **Apartment Management System**. Talks to the
[ams-backend](../README.md) API and renders two separate areas depending on who's signed in:

- **Resident dashboard** (`/dashboard/*`) — for society members: billing, complaints, notices,
  vehicles, visitors.
- **Platform admin** (`/platform/*`) — for the super admin: society directory, society creation,
  cross-society complaints overview.

## Requirements

- Node.js 20+
- A running instance of [ams-backend](../README.md)

## Setup

```bash
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:9090/api/v1" > .env.local   # optional, see below for default
npm run dev
```

Open [http://localhost:9095](http://localhost:9095).

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the dev server (Next.js) |
| `npm run build` | Production build               |
| `npm run start` | Run the production build       |
| `npm run lint`  | Lint with ESLint               |

## Environment Variables

| Variable              | Required | Default                        | Description                     |
| --------------------- | -------- | ------------------------------ | ------------------------------- |
| `NEXT_PUBLIC_API_URL` | No       | `http://localhost:9090/api/v1` | Base URL of the AMS backend API |

## Architecture

### Routing

```
app/
  login/                 # Public login page
  (resident)/
    layout.tsx           # Redirects unauthenticated users to /login; super admins to /platform
    dashboard/            # Resident pages (billing, complaints, flat, notices, vehicles, visitors)
  (platform)/
    layout.tsx           # Redirects non-super-admins away
    platform/
      page.tsx           # Overview: stats, society growth chart, recent complaints
      societies/         # Society directory, creation, detail
      complaints/        # Cross-society complaints table
```

Both layouts gate on `useAuth()` status and `user.isSuperAdmin`, so a resident never sees the
platform area and vice versa.

### Auth flow

- `AuthProvider` (`src/providers/authProvider.tsx`) owns auth state — token, user, societies, and
  the active society — and exposes it via `useAuth()` (`src/hooks/useAuth.ts`).
- On mount it restores a persisted session (`src/lib/authStorage.ts`, `localStorage`) and revalidates
  it against `GET /auth/me` before marking the user authenticated.
- `login()` calls the backend, persists the session, and returns the user so callers can route
  super admins to `/platform` and everyone else to `/dashboard`.
- Effective permissions for the active society are derived into a `Set<PermissionKey>`; check them
  with `has(Permission.X)` rather than branching on role names.

### API client

`src/lib/apiClient.ts` wraps `fetch`, attaches `Authorization` / `X-Society-Token` headers, and
unwraps the backend's `ApiResponse` envelope (shared type from `../shared`), throwing
`ApiClientError` on failure. Feature-specific request functions live in `src/lib/authApi.ts` and
`src/lib/societyApi.ts`.

## UI Conventions

- **Tailwind CSS only** — no plain CSS files or inline `style={}`.
- **shadcn/ui first** — check `src/components/ui/` before writing a component from scratch.
- File names are `camelCase` (e.g. `complaintsTable.tsx`, `useAuth.ts`).
- No comments in component code unless explaining a genuinely non-obvious workaround.

See the root [CLAUDE.md](../CLAUDE.md) for the full set of agent/contributor rules.
