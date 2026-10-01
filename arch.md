# Stride Architecture (Simple Overview)

Stride is a running companion app. This document explains how the whole system fits
together in plain language.

## 1. The Big Picture

There are three separate applications in this repository:

| App | Folder | Role |
| --- | --- | --- |
| Mobile app | `apps/mobile` | The real product. Expo + React Native. What runners use. |
| Backend API | `apps/api` | The brain. NestJS + PostgreSQL. Owns all rules and data. |
| Web prototype | `src/` (root Next.js) | A reference/design sandbox. Not the production app. |

Rule of thumb: the **mobile app talks only to the backend API**. The backend talks to
the database. The web prototype is kept only as a design reference.

```text
Phone (Expo app)
   |  HTTPS + bearer token
   v
NestJS API  ----> PostgreSQL (system of record)
   |
   +----> background worker (email/outbox, future sync)
```

## 2. Mobile App (`apps/mobile`)

The part the user sees and touches.

- **Framework:** Expo SDK 54, React Native, React 19, TypeScript.
- **Server data:** TanStack Query (caching, loading, refetch).
- **Local UI state:** Zustand (which tab is open, which overlay is showing, the session).
- **Secure storage:** Expo SecureStore holds the login tokens safely on the device.

### How a screen gets data
1. A screen (e.g. Dashboard) calls a hook like `useDashboard()`.
2. The hook (`src/hooks/use-stride-data.ts`) calls the API through `apiRequest()`.
3. The API returns canonical data (meters, seconds), which the hook converts to
   display units (km, pace).
4. The screen renders. Empty accounts show honest "nothing yet" states.

### Login and sessions
- The login screen sends email + password to `/auth/login`.
- The API returns `accessToken`, `refreshToken`, and `userId`.
- These are saved in SecureStore and in the Zustand session store.
- On app start, the saved session is restored, so the user stays logged in.
- If a request gets a `401` (expired token), the client silently refreshes the token
  **once** (single-flight, so parallel requests don't all refresh at once) and retries.
- Logout clears the token, the device storage, and the cached data.

### Forms that actually save
Three creation forms are wired to the backend:
- **Log manual run** → `POST /activities`
- **Add gear** → `POST /gear`
- **Create goal** → `POST /goals`

After a successful save, related queries (dashboard, activities, gear, goals) are
refreshed so every screen stays consistent with the server. No fake success.

### Account safety
Query cache keys include the `userId`, so one account can never see another account's
cached data, even after switching accounts.

## 3. Backend API (`apps/api`)

The source of truth. All business rules live here, not in the app.

- **Framework:** NestJS 11, Prisma 6, PostgreSQL.
- **Structure:** domain modules — each owns one area:
  - `access` → authentication (login, register, refresh, password reset)
  - `training` → activities (runs)
  - `gear` → shoes/equipment and mileage
  - `goals` → distance/count/longest-run targets
  - `profile` → name, units, timezone, preferences
  - `dashboard` → combined weekly summary + latest activity

### Important backend rules
- **Everything is user-scoped.** Every query filters by the logged-in user. A record ID
  alone is never enough to access data.
- **Canonical units.** Distances are stored in meters, durations in seconds. Conversion
  to km/miles happens at the edges (the app).
- **Safe edits (optimistic concurrency).** Updates must send `expectedVersion`. If the
  data changed since you read it, the API returns `412` instead of overwriting.
- **Gear mileage is calculated, not incremented.** Usage = opening mileage + sum of
  assigned run distances. Deleting or reassigning a run automatically corrects totals.
- **Goals are computed.** Progress is calculated from qualifying activities using the
  goal's timezone (handles week/month boundaries and daylight saving). Clients cannot
  write progress directly.
- **Validation.** Future-dated runs and invalid numbers are rejected.

### Authentication details
- Passwords are hashed with **Argon2id**.
- Refresh tokens are stored **hashed**; access tokens (JWT) are short-lived.
- Every protected request is checked against a live session.
- Reusing an old refresh token revokes the session (replay protection).
- Password reset revokes existing sessions.

## 4. Database (PostgreSQL)

- The single system of record.
- Managed with **Prisma** (schema in `apps/api/prisma/schema.prisma`, migrations in
  `apps/api/prisma/migrations`).
- Core tables: User, Session, Profile, Activity, Gear, Goal, plus auth/token tables.
- Timestamps are timezone-aware; IDs are UUIDs.

## 5. Background Worker

- A separate process (`npm run worker`) drains an email outbox to local SMTP in
  development (so verification/reset emails appear in the dev inbox).
- Future home for durable sync jobs and retries.

## 6. What's Intentionally Off in V1

- **Strava:** disabled. No OAuth, no sync, no webhooks (pending policy/approval review).
- **AI:** disabled.
- **Live GPS recording:** out of scope.
- Notification *preferences* are saved, but no notifications are actually delivered yet.

## 7. Running It Locally

### Prerequisites
- **Node.js 22**
- Windows PowerShell (commands below use PowerShell; chain steps with `;`, not `&&`)
- Run commands from the correct app directory. Each app has its own dependencies.

### Step 0 — Install dependencies (once)
Install separately in each project. Use `npm ci` where a lockfile exists.

```powershell
# repository root
npm ci

# API
cd apps/api; npm ci; cd ../..

# mobile
cd apps/mobile; npm ci; cd ../..
```

### Step 1 — Start the API services (Terminal A)
Keep this terminal running. It starts PostgreSQL (5432), SMTP (1025), and the dev
mail inbox (8025).

```powershell
cd apps/api
npm run local:configure   # generates .env only if it doesn't already exist
npm run db:generate
npm run local:services    # leave running
```

### Step 2 — Migrate, build, and start the API (Terminal B)
```powershell
cd apps/api
npm run db:migrate
npm run build
npm start                 # API on http://localhost:3001
```

### Step 3 — Start the mail worker (Terminal C, optional)
Needed only for verification/reset emails to appear in the dev inbox.

```powershell
cd apps/api
npm run worker
```

### Step 4 — Start the mobile app (Terminal D)
```powershell
cd apps/mobile
npm run web -- --port 8082   # app on http://localhost:8082
```

> The `--offline` flag is intentional and preserved: org networking blocks Expo's
> online startup. It does **not** block local API requests.

### Key URLs
- App: http://localhost:8082
- API health: http://localhost:3001/v1/health
- API docs (Swagger): http://localhost:3001/v1/docs
- Dev mail inbox: http://localhost:8025

### Create an account to log in
There is no auto-seeded login. Register through the app, then check the dev inbox at
http://localhost:8025 for the verification link (the worker in Step 3 must be running).
After verifying, log in from the app.

### Running on a physical phone
On a device, `localhost` means the phone itself. Point the app at your computer's LAN
address using an env var before starting Expo:

```powershell
cd apps/mobile
$env:EXPO_PUBLIC_API_URL = "http://192.168.x.x:3001/v1"   # your computer's LAN IP
npm run web -- --port 8082
```

### Quick health check
```powershell
(Invoke-WebRequest -UseBasicParsing http://localhost:3001/v1/health).Content
(Invoke-WebRequest -UseBasicParsing http://localhost:8082).StatusCode
```

## 8. One-Line Summary

The **Expo app** is the product, the **NestJS API** owns all rules and data in
**PostgreSQL**, the **worker** handles background jobs, and the root **Next.js app** is
just a design reference — not production.
