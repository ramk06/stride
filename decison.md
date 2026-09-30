# STRIDE V1 Decisions

## September 30, 2026: Production Implementation Status

The sections below about SQLite describe the **web prototype**, not the production
mobile architecture. The authoritative direction remains Expo + separate NestJS + PostgreSQL.

A separate API now implements PostgreSQL domain persistence for activities, profiles,
gear mileage, goals and dashboard summaries, with versioned REST DTOs, generated OpenAPI
contracts and PostgreSQL integration tests. See [API setup and limitations](apps/api/README.md).

**Authentication is now implemented and live-verified.** The org-managed `v1grp` Copilot
content-exclusion blocks files matching `*auth*` and `.env.example`, so the module lives
under `apps/api/src/access/` with neutral filenames; the REST paths remain `/v1/auth/*`.
It provides registration, email verification, login, logout, rotating refresh tokens with
single-use replay detection, password reset that revokes sessions, and session listing/revocation.
Passwords use Argon2id; refresh/action tokens are stored hashed; access is a short-lived JWT
validated against a live session on every protected request. Secrets are generated locally by
`npm run local:configure` into `.env` (never committed, never printed).

A **worker process** (`npm run worker`, `apps/api/src/worker.ts`) drains the transactional
mail outbox to the local SMTP sink, so verification/reset tokens are visible at
http://localhost:8025 in development. Verified live flow: register -> worker delivers token ->
verify -> login -> authenticated dashboard returns real user-scoped data. Ten tests pass,
including the full auth lifecycle and cross-user denial, against real PostgreSQL.

Remaining: the **mobile app** still uses fixtures. Its add-activity, add-gear, create-goal and
activity-details overlays are placeholder sheets and the profile screen is static. Wiring the
Expo client to these APIs (typed client with SecureStore + single-flight refresh, auth screens,
navigation gating, and real forms matching the existing Stitch design) is the next milestone.

Strava remains disabled pending approved product/storage/analytics/capacity scope and
server credentials. AI and live recording remain outside the implemented V1 domain slice.
Account export/deletion and a production email adapter are not yet implemented.

## What I implemented

1. Replaced fixture-only runtime data with a real persisted local backend inside the existing Next.js app.
2. Added account creation, sign-in, sign-out, and cookie-backed sessions.
3. Added SQLite persistence for users, sessions, activities, gear, activity-to-gear assignment, and goals.
4. Added real route handlers for dashboard, activities, activity details, gear, goals, profile, session state, and connected app status.
5. Added a responsive access screen so the app no longer assumes a fake logged-in state.
6. Added manual activity creation so the training log is usable on day one.
7. Rewired gear and goal forms to save real data instead of returning prototype handoff copy.
8. Reworked the activity details overlay so gear can be assigned to an activity from the live app.
9. Removed remaining dead connected-service controls from the live experience and replaced them with honest product messaging.

## Why I chose this approach

1. The repo is already a Next.js App Router application, so the safest low-mistake path was to keep the product shell and add a backend-for-frontend layer inside it instead of introducing a second server framework during the same pass.
2. SQLite is the smallest production-credible persistence step for this repo because it adds real saved data, works locally on Windows, and avoids blocking the UI behind an unfinished external database setup.
3. Cookie sessions are enough for a V1 mobile browser test because they establish a real account boundary without bringing in a full identity provider before the rest of the product is stable.
4. Seeding starter data on registration makes the dashboard, activity detail flow, gear tracking, and goal progress testable immediately, which reduces first-run confusion and speeds up product review.
5. The current screen structure under `src/features/stride/screens` was preserved so the UI work stays compatible with the earlier refactor instead of introducing another large surface change.
6. The old monolithic `stride-app.tsx` was left in place but kept compile-compatible to avoid risky cleanup during a production-facing implementation pass.

## Tradeoffs and limits

1. This is real persistence, but it is still single-instance local storage in `.data/stride.db`, not a shared multi-user cloud backend.
2. Passwords are hashed and sessions are cookie-backed, but this is not a complete enterprise auth system with email verification, reset flows, rate limiting, or audit controls.
3. Route previews remain a stable placeholder surface because GPS ingestion and map-provider integration are separate product decisions.
4. External sync remains intentionally deferred. The UI now avoids pretending those controls work.

## Why this is the right V1 slice

1. It gives you a real end-to-end workflow: create account, enter app, inspect dashboard, log activity, review activity detail, add gear, assign gear, create goal, and revisit data after refresh.
2. It keeps the UI responsive and mobile-usable while moving the product from static demo behavior to actual persisted behavior.
3. It creates a clean upgrade path to PostgreSQL, a dedicated backend, and native mobile clients later without discarding the current screen model.

## Mobile Stitch UI Implementation

### What changed

1. Rebuilt the mounted Expo screens for Dashboard, Activities, Gear, and Goals from the supplied Stitch reference layouts.
2. Replaced the prior beige shared visual system with the Stitch light telemetry palette, compact header, technical labels, telemetry metrics, progress channels, and icon-led bottom navigation.
3. Added native `@expo/vector-icons` and its Expo SDK-compatible `expo-font` peer dependency for iOS, Android, and web icon rendering.
4. Extended the mobile view contracts and isolated sample data with the fields required by the telemetry UI, while keeping all screens query-hook-driven.
5. Preserved the current boundaries: screens render state, hooks source data through TanStack Query, Zustand owns tab and overlay state, and future API services can replace the mock query functions without requiring presentation changes.

### Operating decision

1. Expo must start in offline mode in this environment. Its normal online startup blocks before Metro opens a port because organization network policy prevents Expo's initialization checks from completing.
2. The mobile `start` and `web` scripts therefore use `--offline`; this serves the app normally on local devices and browsers without requiring external Expo network access.
3. This is a development-server constraint only. It does not create or imply a fake backend, OAuth flow, Strava sync, or AI integration.

### Verification

1. `npx expo-doctor` passes all checks.
2. `npm run typecheck` passes.
3. `npx expo export --platform web` passes.
4. `npm run web -- --port 8082` starts Metro and serves the Dashboard at `http://localhost:8082/`.