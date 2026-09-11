# STRIDE V1 Decisions

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