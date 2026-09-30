# Stride Mobile

This folder contains the first Expo-based mobile scaffold for Stride.

## Purpose

- Keep the current Next.js app as the product prototype and design reference.
- Build the real mobile product in a separate Expo app.
- Reuse the same feature boundaries: dashboard, activities, gear, goals, profile, and sync state.

## Current status

September 30, 2026: a separate PostgreSQL-backed NestJS domain implementation is now
available in [the API application](../api/README.md). It is not connected to this mobile
scaffold. Authentication source creation was blocked by editor exclusions, which the user
chose to retain; API account-data routes deliberately remain closed. This mobile app still
uses fixtures, including prototype-only sync/insight labels. Those labels are not evidence
of real Strava connectivity, AI, or persisted runner data. No mobile completion is claimed.

Keep Expo startup offline in this environment (`npm run start` / `npm run web` already
include `--offline`). The current app's typecheck and web export passed; native device
workflows have not been verified.

This scaffold includes:
- Expo app bootstrapping
- TanStack Query provider
- Zustand app shell state
- Mobile tab shell
- Placeholder overlay flows for activity detail, add activity, add gear, create goal, and sync status
- Sample half-marathon oriented fixture data

This scaffold does not yet include:
- authentication
- secure token storage wiring
- real backend HTTP client
- React Navigation stacks
- native map provider
- persistence or mutation APIs

## Run locally

1. Open a terminal in `apps/mobile`
2. Run `npm install`
3. Run `npm run start`
4. Use `npm run android` or `npm run ios` after native prerequisites are available
5. Run `npm run typecheck` for a focused TypeScript check

## Next implementation steps

1. Add React Navigation tabs and stacks
2. Replace sample queries with a real API client
3. Add auth and secure session handling
4. Implement activity, gear, and goal mutations
5. Connect sync status to the future backend
