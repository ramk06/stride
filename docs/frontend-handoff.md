# STRIDE Frontend Handoff

This repo is a Next.js web prototype used to refine Stride's mobile-first product surface before a dedicated Expo mobile app exists. The UI is real. The data in the fixture layer is sample data only.

## Primary Architecture Reference

The authoritative mobile-first architecture document is `docs/mobile-architecture.md`.

Use that file as the source of truth for:
- production system boundaries
- mobile app scope
- backend responsibilities
- delivery phases

## Current Structure

- `src/features/stride/screens/DashboardScreen.tsx`: dashboard surface and runner summary.
- `src/features/stride/screens/ActivitiesScreen.tsx`: activity list, search, and filters.
- `src/features/stride/screens/ActivityDetailsScreen.tsx`: activity details, route container, splits, and AI entry.
- `src/features/stride/screens/GearScreen.tsx`: gear locker and category filtering.
- `src/features/stride/screens/AddGearScreen.tsx`: validated add-gear form with honest non-persistent submission states.
- `src/features/stride/screens/GoalsScreen.tsx`: active and completed goal views.
- `src/features/stride/screens/CreateGoalScreen.tsx`: adaptive goal creation form.
- `src/features/stride/screens/ProfileScreen.tsx`: runner profile, settings, and architecture handoff section.
- `src/features/stride/screens/SyncScreen.tsx`: Strava connection, syncing, and error states.
- `src/features/stride/screens/AIBuddyScreen.tsx`: optional AI shell without fabricated responses.
- `src/features/stride/stride-shell.tsx`: app shell, tab selection, overlay routing, and preview-state switching.
- `src/features/stride/api.ts`: temporary data adapters that currently read fixtures.
- `src/features/stride/hooks.ts`: temporary hook boundary that can be upgraded to TanStack Query.
- `src/features/stride/sample-data.ts`: visual sample data only. No source of truth.

## What Is Real vs Placeholder

- Real: navigation shape, mobile-first layout, reusable UI components, loading and error shells, forms, and feature ownership.
- Placeholder: fixture data, simulated gear and goal mutations, Strava sync status, and AI conversation responses.
- Not implemented: authentication, persistence, backend API calls, real map provider, real Strava OAuth, and AI inference.

## How To Replace The Fixture Layer

The intended boundary is:

`Screen -> feature hook -> API client -> Stride backend`

Current examples:

- `useDashboard()` -> `dashboardApi.getDashboard()`
- `useActivities()` -> `activitiesApi.getActivities()`
- `useActivityDetails()` -> `activitiesApi.getActivityDetail()`
- `useGear()` -> `gearApi.getGear()`
- `useGoals()` -> `goalsApi.getGoals()`
- `useProfile()` -> `profileApi.getProfile()`
- `useStravaConnection()` -> `stravaApi.getConnection()`
- `useConversation()` -> `aiApi.getConversation()`

When backend work starts:

1. Replace each fixture-returning function in `src/features/stride/api.ts` with a real HTTP call.
2. Keep mapping logic in the API layer so screen components do not know raw backend DTO shapes.
3. Upgrade each hook in `src/features/stride/hooks.ts` to TanStack Query.
4. Preserve the current screen props and render logic as much as possible.

Example backend targets:

- `GET /v1/dashboard`
- `GET /v1/activities`
- `GET /v1/activities/:id`
- `GET /v1/gear`
- `POST /v1/gear`
- `GET /v1/goals`
- `POST /v1/goals`
- `GET /v1/profile`
- `GET /v1/strava`
- `POST /v1/strava/sync`
- `GET /v1/ai`

## TanStack Query Migration

Recommended sequence:

1. Add a shared API client with auth headers, JSON parsing, and typed error handling.
2. Convert read hooks to query hooks.
3. Convert form submissions to mutation hooks.
4. Introduce query keys by feature, not one global bucket.
5. Keep Zustand limited to client-only UI state.

Suggested query key pattern:

- `['dashboard', period]`
- `['activities', filters]`
- `['activity', activityId]`
- `['gear']`
- `['goals']`
- `['profile']`
- `['strava', 'connection']`
- `['ai', 'conversation', conversationId]`

## Expo Mobile Translation

This web prototype should not be forced into becoming the mobile app. The intended move is to reuse the product structure and feature boundaries in a dedicated Expo app:

- Bottom tabs: Dashboard, Activities, Gear, Goals, Profile.
- Feature stacks: Activity details, add gear, create goal, Strava status, AI Buddy.
- Shared UI tokens: color, typography, spacing, radius, iconography.

The current screen files are shaped so each one can map closely to a future React Native screen.

## Local Validation

Current verified commands:

- `npm run lint`
- `npm run build`

## Local Run

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
3. Open `http://localhost:3000` in a browser.
4. Use `npm run lint` before committing.
5. Use `npm run build` to validate a production compile.