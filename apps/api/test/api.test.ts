import 'reflect-metadata';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule, configure, createApp } from '../src/app';
import { IdentityGuard, IdentityRequest } from '../src/common/identity';

if (!process.env.DATABASE_URL || !new URL(process.env.DATABASE_URL).pathname.endsWith('/stride_test')) throw new Error('Integration tests require the isolated stride_test PostgreSQL database.');
const db = new PrismaClient();
const owner = randomUUID();
const other = randomUUID();
let app: INestApplication;
async function testApp() {
  const module = await Test.createTestingModule({ imports: [AppModule] }).overrideGuard(IdentityGuard).useValue({
    canActivate(context: ExecutionContext) {
      const incoming = context.switchToHttp().getRequest<IdentityRequest>();
      const candidate = incoming.headers['x-test-actor'];
      if (candidate !== owner && candidate !== other) return false;
      incoming.actor = { userId: candidate };
      return true;
    },
  }).compile();
  const instance = module.createNestApplication({ logger: false });
  configure(instance);
  await instance.init();
  return instance;
}
before(async () => {
  await db.user.create({ data: { id: owner, email: `${owner}@test.invalid`, passwordHash: 'not-a-login-credential', profile: { create: {} } } });
  await db.user.create({ data: { id: other, email: `${other}@test.invalid`, passwordHash: 'not-a-login-credential', profile: { create: {} } } });
  app = await testApp();
});
after(async () => {
  await app?.close();
  await db.activity.deleteMany({ where: { userId: { in: [owner, other] } } });
  await db.user.deleteMany({ where: { id: { in: [owner, other] } } });
  await db.$disconnect();
});
const activity = (gearId?: string) => ({ id: randomUUID(), title: 'User-entered run', sport: 'run', startedAt: new Date(Date.now() - 1000).toISOString(), timezone: 'UTC', distanceMeters: 5000, movingSeconds: 1500, elapsedSeconds: 1600, ...(gearId ? { gearId } : {}) });
const shoe = () => ({ id: randomUUID(), name: 'Daily trainer', brand: 'Independent', type: 'shoe', openingMileageMeters: 10000, expectedLifeMeters: 800000 });

test('production requires real bearer auth and rejects forged identity headers', async () => {
  const production = await createApp();
  await production.app.init();
  try {
    for (const path of ['/activities', '/gear', '/goals', '/dashboard', '/users/me/profile']) {
      const result = await request(production.app.getHttpServer()).get(`/v1${path}`).set('x-test-actor', owner).expect(401);
      assert.equal(result.body.code, 'HTTP_401');
    }
    const connection = await request(production.app.getHttpServer()).get('/v1/strava/connection').expect(200);
    assert.equal(connection.body.status, 'disabled');
    assert.equal(connection.body.aiEnabled, false);
  } finally { await production.app.close(); }
});

test('persisted activity flow updates dashboard, gear and goals and survives API restart', async () => {
  const equipment = shoe();
  await request(app.getHttpServer()).post('/v1/gear').set('x-test-actor', owner).send(equipment).expect(201);
  const goalId = randomUUID();
  const year = new Date().getUTCFullYear();
  await request(app.getHttpServer()).post('/v1/goals').set('x-test-actor', owner).send({ id: goalId, title: 'Running distance', type: 'distance', target: 10000, period: 'custom', timezone: 'UTC', startsOn: `${year}-01-01`, endsOn: `${year}-12-31` }).expect(201);
  const input = activity(equipment.id);
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send(input).expect(201);
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send(input).expect(201);
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send({ ...input, title: 'Different' }).expect(409);
  const dashboard = await request(app.getHttpServer()).get('/v1/dashboard').set('x-test-actor', owner).expect(200);
  assert.equal(dashboard.body.distanceMeters, 5000);
  assert.equal(dashboard.body.activityCount, 1);
  assert.equal(dashboard.body.latest.routeAvailable, false);
  let gear = await request(app.getHttpServer()).get('/v1/gear').set('x-test-actor', owner).expect(200);
  assert.equal(gear.body.items[0].usageMeters, 15000);
  let goals = await request(app.getHttpServer()).get('/v1/goals').set('x-test-actor', owner).expect(200);
  assert.equal(goals.body.items[0].progress, 5000);
  await app.close();
  app = await testApp();
  await request(app.getHttpServer()).get(`/v1/activities/${input.id}`).set('x-test-actor', owner).expect(200);
  const changes = await Promise.all([
    request(app.getHttpServer()).patch(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, distanceMeters: 6000 }),
    request(app.getHttpServer()).patch(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, distanceMeters: 7000 }),
  ]);
  assert.deepEqual(changes.map(result => result.status).sort(), [200, 412]);
  const distance = changes.find(result => result.status === 200)!.body.distanceMeters;
  goals = await request(app.getHttpServer()).get('/v1/goals').set('x-test-actor', owner).expect(200);
  assert.equal(goals.body.items[0].progress, distance);
  await request(app.getHttpServer()).patch(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 2, gearId: null }).expect(200);
  gear = await request(app.getHttpServer()).get('/v1/gear').set('x-test-actor', owner).expect(200);
  assert.equal(gear.body.items[0].usageMeters, 10000);
  await request(app.getHttpServer()).delete(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 3 }).expect(204);
  goals = await request(app.getHttpServer()).get('/v1/goals').set('x-test-actor', owner).expect(200);
  assert.equal(goals.body.items[0].progress, 0);
});

test('cross-user activity reads/writes, gear assignment, gear and goal edits are denied', async () => {
  const equipment = shoe();
  await request(app.getHttpServer()).post('/v1/gear').set('x-test-actor', other).send(equipment).expect(201);
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send(activity(equipment.id)).expect(404);
  const input = activity();
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', other).send(input).expect(201);
  await request(app.getHttpServer()).get(`/v1/activities/${input.id}`).set('x-test-actor', owner).expect(404);
  await request(app.getHttpServer()).patch(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, title: 'Attack' }).expect(404);
  await request(app.getHttpServer()).delete(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 1 }).expect(404);
  await request(app.getHttpServer()).patch(`/v1/gear/${equipment.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, name: 'Attack' }).expect(404);
  const goal = await db.goal.create({ data: { userId: other, title: 'Private', type: 'count', target: 10, period: 'week', timezone: 'UTC', startsOn: '2026-01-01', endsOn: '2026-12-31' } });
  await request(app.getHttpServer()).patch(`/v1/goals/${goal.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, target: 1 }).expect(404);
  await assert.rejects(db.activity.create({ data: { ...activity(equipment.id), userId: owner } }));
});

test('validation rejects client totals, invalid metrics, null patches and invalid calendars', async () => {
  for (const extra of [{ distanceMeters: -1 }, { elapsedSeconds: 1 }, { startedAt: '2039-01-01T00:00:00Z' }, { timezone: 'Not/AZone' }, { userId: other }, { source: 'strava' }]) {
    await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send({ ...activity(), ...extra }).expect(422);
  }
  const input = activity();
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send(input).expect(201);
  await request(app.getHttpServer()).patch(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, distanceMeters: null }).expect(422);
  await request(app.getHttpServer()).post('/v1/goals').set('x-test-actor', owner).send({ id: randomUUID(), title: 'Invalid', type: 'count', target: 1, period: 'custom', timezone: 'UTC', startsOn: '2026-02-30', endsOn: '2026-03-01' }).expect(422);
  await assert.rejects(db.activity.create({ data: { ...activity(), userId: owner, source: 'strava', externalId: '9007199254740993' } }));
  await request(app.getHttpServer()).delete(`/v1/activities/${input.id}`).set('x-test-actor', owner).send({ expectedVersion: 1 }).expect(204);
});

test('search and cursor pagination are stable when timestamps are equal', async () => {
  const startedAt = '2026-01-01T12:00:00Z';
  const ids = [randomUUID(), randomUUID(), randomUUID()];
  for (const id of ids) await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send({ ...activity(), id, startedAt, title: 'Pagination test' }).expect(201);
  const first = await request(app.getHttpServer()).get('/v1/activities?limit=2&search=Pagination').set('x-test-actor', owner).expect(200);
  const second = await request(app.getHttpServer()).get(`/v1/activities?limit=2&search=Pagination&cursor=${first.body.nextCursor}`).set('x-test-actor', owner).expect(200);
  assert.equal(first.body.items.length, 2);
  assert.equal(second.body.items.length, 1);
  assert.equal(new Set([...first.body.items, ...second.body.items].map(item => item.id)).size, 3);
  await request(app.getHttpServer()).get('/v1/activities?limit=51').set('x-test-actor', owner).expect(422);
  await request(app.getHttpServer()).get('/v1/activities?cursor=garbage').set('x-test-actor', owner).expect(422);
});

test('profile versioning, goal archive and gear retirement are persisted', async () => {
  const profile = { displayName: 'Real runner', units: 'mi', timezone: 'America/New_York', experience: 'regular', notifications: false, expectedVersion: 1 };
  await request(app.getHttpServer()).patch('/v1/users/me/profile').set('x-test-actor', owner).send(profile).expect(200);
  await request(app.getHttpServer()).patch('/v1/users/me/profile').set('x-test-actor', owner).send(profile).expect(412);
  const equipment = shoe();
  await request(app.getHttpServer()).post('/v1/gear').set('x-test-actor', owner).send(equipment).expect(201);
  await request(app.getHttpServer()).patch(`/v1/gear/${equipment.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, retiredAt: new Date().toISOString() }).expect(200);
  await request(app.getHttpServer()).post('/v1/activities').set('x-test-actor', owner).send(activity(equipment.id)).expect(409);
  const goal = await db.goal.findFirstOrThrow({ where: { userId: owner } });
  await request(app.getHttpServer()).patch(`/v1/goals/${goal.id}`).set('x-test-actor', owner).send({ expectedVersion: 1, archivedAt: new Date().toISOString() }).expect(200);
  const active = await request(app.getHttpServer()).get('/v1/goals').set('x-test-actor', owner).expect(200);
  assert.equal(active.body.items.length, 0);
});