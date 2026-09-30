# Stride API: Domain Milestone, Not a Complete Product

This separate NestJS/PostgreSQL application implements and tests profile, activity,
gear, goal and dashboard domain persistence. It is **not ready for production or
mobile account use**. Copilot exclusions rejected authentication source files and
environment templates; the user explicitly elected to keep those exclusions.
All account-data endpoints therefore fail closed with `503 IDENTITY_UNAVAILABLE`.
There is no debug-login endpoint, trusted user header, or production test-identity mode.

## Local Setup (PowerShell, Node 22)

From the repository root:

```powershell
cd apps/api
npm ci
npm run local:services
```

This starts a real PostgreSQL process on loopback port 5432, SMTP on 1025, and an
in-memory development inbox at http://localhost:8025. PostgreSQL files persist in
the ignored `.postgres` directory; mail is ephemeral and limited to 100 messages.
Use Ctrl+C for orderly shutdown. Fresh clusters use UTF-8. An older local cluster
created before that setting may retain WIN1252; recreate only a disposable cluster
or migrate it before storing Unicode runner data. Never synchronize this directory
to a shared drive in a production deployment.

Alternatively, with Docker installed, use `docker compose up -d` in this directory.
That starts PostgreSQL 17 and Mailpit instead. Do not run both options on the same ports.
The checked-in loopback credentials are deliberately local-only, not production secrets.

In a second terminal, from this directory:

```powershell
$env:DATABASE_URL='postgresql://stride:stride_local_only@localhost:5432/stride?connection_limit=5'
$env:PORT='3001'
$env:WEB_ORIGIN='http://localhost:8082'
npm run db:generate
npm run db:migrate
npm run build
npm run start
```

API health: http://localhost:3001/v1/health
OpenAPI: http://localhost:3001/v1/docs
Provider status: http://localhost:3001/v1/strava/connection

Health verifies database reachability and explicitly reports `accountAccess: blocked`.
It is not a product-readiness signal. There is currently no worker command because
no background feature is implemented. SMTP delivery is available as local infrastructure,
but registration/reset email delivery is not implemented.

## Verification

Observed September 30, 2026 on Windows / Node 22:

- Both Prisma migrations applied successfully to empty development and test PostgreSQL databases.
- Schema validation/generation, API build/typecheck/lint and OpenAPI type generation passed.
- Eight tests passed: six PostgreSQL-backed API scenarios and two calendar/DST scenarios.
  The persisted-data scenario creates an activity, checks dashboard/gear/goals, restarts the
  Nest application, then checks concurrent version conflicts, reassignment and deletion.
- API dependency audit: zero vulnerabilities after reviewed dependency overrides.
- Existing Expo typecheck and web export passed. Next.js prototype lint and production build passed.
- Live API health and docs returned 200; account data returned the intended structured 503;
  provider status reported disabled and AI false.
- Android SDK/emulator commands were unavailable; iOS native verification was unavailable on Windows.
  No native workflow, refresh-token, mail-delivery, worker, account-deletion or backup-restore test ran.
- The preserved web prototype's production dependency audit reports five advisories (one moderate,
  three high, one critical), including Next.js 16.2.10. Its dependency upgrade remains separate work;
  do not expose that prototype publicly on the strength of a successful build.

The local service creates an isolated `stride_test` database. For Docker, first run:
`docker compose exec postgres createdb -U stride stride_test` (once).

```powershell
$env:DATABASE_URL='postgresql://stride:stride_local_only@localhost:5432/stride_test?connection_limit=5'
npm run db:migrate
npm test
npm run typecheck
npm run lint
npm run contracts
npm audit
```

Tests refuse to run against a database not named `stride_test`. They create unique
synthetic owners, exercise real PostgreSQL migrations/HTTP/domain behavior, and remove
only those owners afterward. Nest's test container overrides the closed identity guard;
this is **not a test of registration, login, token rotation, or real bearer authorization**.
The production-boundary test proves a forged test header cannot unlock the real app.

Generated REST contracts live in `packages/contracts` at repository root. Regenerate
after DTO/controller changes. They do not export Prisma models. The Expo client is not
yet wired to these contracts.

## Explicit Demo Seed

No signup or startup automatically seeds activities. To create an isolated synthetic
owner for database inspection only:

```powershell
$env:DATABASE_URL='postgresql://stride:stride_local_only@localhost:5432/stride?connection_limit=5'
$env:ALLOW_DEMO_SEED='yes'
npm run db:seed:demo
Remove-Item Env:ALLOW_DEMO_SEED
```

The seed account is deliberately unverified and has no usable password or session.
Do not present its activity as a manually entered real run.

## Domain Rules

- Activities accept user-entered meters, moving seconds, elapsed seconds, an explicit
  timezone and offset-bearing timestamp. Future activities and invalid metrics are rejected.
- Lists use stable `(startedAt,id)` keyset cursors, search and sport filters; limit is 50.
- Create IDs are client UUIDs. An identical repeat returns the existing object; a different
  body for the same existing ID conflicts. This is not yet a durable idempotency-key ledger:
  deleting a record also deletes this deduplication evidence. Do not automatically retry writes.
- PATCH/DELETE require `expectedVersion`; stale writes return 412. User-scoped write locks
  serialize related edits. Transaction acquisition/execution are bounded at ten seconds.
- Gear ownership is enforced both in services and by a composite database foreign key.
  Retired gear remains in history and cannot be newly assigned. One optional gear item per
  activity is supported; multiple accessories and shoe-role assignments remain unimplemented.
- Usage is opening mileage plus SUM of assigned manual activity distances. Edits, deletion
  and reassignment change the sum without counters. Shoe baselines/lifespans cannot be applied
  to equipment. Route/split availability is false; no placeholder route is returned.
- Goals support cumulative distance, activity count and longest qualifying run. Runs/trail
  runs qualify, walking does not. Targets use meters or counts; clients cannot write progress.
  Weeks start Monday in the goal's stored IANA timezone. Months use local calendar months.
  Boundaries are half-open UTC instants derived from local midnight, including DST. Start/end
  dates are inclusive and clip each period. Outside a goal's date range, its first/last period
  is displayed. Dashboard uses the profile timezone's current Monday-start running week.
- Gear/goal metadata lists are paginated and filter active/archived/all. Profile preferences
  are persisted only; a notification preference does not imply a delivery service exists.
- Durable storage accepts only manual-source records. Strava and AI are disabled; there is
  no OAuth exchange, credential storage, webhook, sync job or simulated connection.

## Deployment and Retention Gate

Do not deploy this milestone as a public runner application. Required unfinished gates:
verified accounts, session lifecycle, action-token delivery, account export/deletion,
mobile secure credentials, and actual identity authorization tests.

For eventual deployment, use separate paid API and worker services plus same-region
managed PostgreSQL. Apply migrations once as a release task. The API requires HTTPS at
the ingress, explicit allowed browser origins, connection pool limits and server-only
environment secrets. Trust proxy settings must match the actual ingress before using
client-IP rate limits. Current in-memory throttling is single-process only.

The future worker must use a durable PostgreSQL-backed queue and transactional outbox;
there is no running worker or implemented outbox dispatcher yet. Use a production SMTP
adapter with TLS and managed credentials, never the loopback inbox. Configure SPF, DKIM,
DMARC and delivery monitoring. Do not put any secrets in Expo public configuration.

Back up permitted first-party data with encrypted point-in-time recovery; test restoration
to an isolated environment. Before launch, approve backup expiry/RPO/RTO and implement
deletion replay so a restored backup cannot resurrect deleted accounts. Current activity
DELETE permanently removes its row; gear retirement/goal archive retain history. **No
account deletion endpoint or promised account-retention SLA exists yet.** Unused session,
action-token, export and outbox tables in the initial schema are not implemented features.

Monitor health, latency, 5xx, pool utilization, migration failures, and eventual worker queue
age/retries. Current error logs contain request IDs and error codes/types, not request bodies,
database parameters or credentials. Success-request telemetry and alerting remain deployment work.

Expo must continue to start with `--offline` in this environment. Native development and
release builds need React Navigation, finished secure session wiring, EAS application IDs,
signing credentials configured locally, HTTPS API URL, and device workflow verification.
Native module changes require a new native build, not merely an OTA update. No mobile
release or provider approval is implied by the successful domain tests.