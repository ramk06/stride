# Stride Mobile-First Architecture

Status: authoritative architecture note for the production Stride product.

The current Next.js app in this repository is a prototype reference only. It exists to validate UX, feature boundaries, and domain concepts before the dedicated mobile app is built.

The real production product is:
- Expo mobile app for iOS and Android
- Separate NestJS backend
- PostgreSQL as the system of record

## 1. Purpose

Stride is a mobile-first running and training companion focused on:
- activity tracking
- gear management
- goal tracking
- sync visibility
- profile and preferences

The mobile app is the primary product surface. The backend owns persistence, business rules, authentication, and integrations.

## 2. Related Documents

This document is the main mobile-first architecture source. Supporting references:
- [Frontend handoff](./frontend-handoff.md)
- [Architecture review](./architecture-review.md)

Use this file for product direction and system boundaries. Use the other docs for deeper implementation detail and prototype mapping.

## 3. Product Boundary

### Prototype
The current web app is useful for:
- UX exploration
- screen structure
- feature boundaries
- sample domain modeling

### Production
The real app must be:
- native-feeling on iOS and Android
- network-aware
- secure with token storage
- driven by backend APIs
- resilient to sync and offline conditions

## 4. High-Level Architecture

```text
Expo mobile app
  | HTTPS / JSON / bearer auth
  v
NestJS API
  | auth + business logic + validation
  +--> PostgreSQL
  |     + users
  |     + profile
  |     + activities
  |     + gear
  |     + goals
  |     + sync state
  |
  +--> background workers
        + sync jobs
        + retries
        + webhooks
        + notifications
```

Rule: the mobile app calls the Stride backend only. It does not directly own provider integrations or canonical business logic.

## 5. Primary Tech Stack

### Mobile
- Expo
- React Native
- TypeScript
- React Navigation
- TanStack Query
- Zustand
- Expo SecureStore
- AsyncStorage

### Backend
- NestJS
- TypeScript
- PostgreSQL
- Prisma
- Background job processor

## 6. Mobile App Scope

### V1 screens
- Welcome and authentication
- Dashboard
- Activities
- Activity details
- Add activity
- Gear
- Add gear
- Goals
- Create goal
- Profile
- Sync and connection status

### V1 product capabilities
- registration and login
- profile setup
- activity browsing
- manual activity entry
- gear tracking
- goal creation and progress
- sync state display
- offline-aware cached reads

## 7. Backend Scope

### Core modules
- Auth
- Users
- Profile
- Activities
- Gear
- Goals
- Dashboard
- Sync and Integrations
- Notifications

### Responsibilities
- authentication and session lifecycle
- persistence
- validation
- ownership and permission checks
- derived calculations
- sync orchestration
- integration retries

## 8. Current Repo Mapping

Use the current prototype only as a translation reference.

Important reference files:
- `src/features/stride/stride-shell.tsx`
- `src/features/stride/types.ts`
- `src/features/stride/api.ts`
- `src/features/stride/hooks.ts`
- `src/features/stride/screens/DashboardScreen.tsx`
- `src/features/stride/screens/ActivitiesScreen.tsx`
- `src/features/stride/screens/ActivityDetailsScreen.tsx`
- `src/features/stride/screens/GearScreen.tsx`
- `src/features/stride/screens/AddGearScreen.tsx`
- `src/features/stride/screens/GoalsScreen.tsx`
- `src/features/stride/screens/CreateGoalScreen.tsx`
- `src/features/stride/screens/ProfileScreen.tsx`
- `src/features/stride/screens/SyncScreen.tsx`
- `src/features/stride/screens/AIBuddyScreen.tsx`

These define the product surface, not the final implementation platform.

## 9. Data Architecture

PostgreSQL is the source of truth.

Core entities:
- User
- Session
- Profile
- Activity
- ActivityDetail
- Gear
- Goal
- SyncRun
- Connection
- DeviceInstallation

Data rules:
- all records are user-scoped
- external IDs are stored as strings
- timestamps are timezone-aware
- distances and durations use canonical units
- secrets never live in plain client state

## 10. State Management

### Mobile client
- TanStack Query for server state
- Zustand for local UI-only state
- SecureStore for refresh and session credentials
- AsyncStorage for small preferences and recoverable drafts

### Backend
- canonical business logic
- validation
- ownership checks
- mutation rules
- derived metrics

## 11. Sync and Integration Rules

- provider integrations must be backend-owned
- mobile only shows sync state and triggers sync requests
- retries and reconciliation happen in workers
- policy-sensitive provider data must be explicitly reviewed before production release

Strava-specific work must not be assumed safe by default.

## 12. Delivery Phases

### Phase 1
- define MVP scope
- scaffold Expo app
- scaffold NestJS backend
- set up authentication foundation

### Phase 2
- dashboard
- activities
- gear
- goals
- profile

### Phase 3
- sync flows
- provider connection flows
- notifications
- offline handling improvements

### Phase 4
- release hardening
- observability
- security review
- store readiness

## 13. Constraints

- mobile-first is the real product direction
- the current Next.js app is not the production app
- backend must remain a separate application
- secure token storage is mandatory
- integration logic must be centralized server-side
- AI is optional, not a core dependency
- policy boundaries for provider data must be respected

## 14. Verification

The architecture is considered implemented when:
- the Expo app authenticates against the backend
- dashboard, activities, gear, goals, and profile run on real APIs
- ownership and auth are enforced server-side
- sync states are visible and accurate
- offline and reconnect behavior are predictable
- secure token handling is validated
- worker jobs recover safely from failure

## 15. Final Statement

The current Next.js repository is a prototype reference for Stride's product surface.

The production Stride system is a new Expo mobile application backed by a separate NestJS + PostgreSQL backend. All future implementation decisions should optimize for that mobile-first architecture.
