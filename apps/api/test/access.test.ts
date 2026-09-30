import 'reflect-metadata';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app';
import { unseal } from '../src/access/credentials';

if (!process.env.DATABASE_URL || !new URL(process.env.DATABASE_URL).pathname.endsWith('/stride_test')) throw new Error('Integration tests require the isolated stride_test PostgreSQL database.');
if (!process.env.JWT_SECRET || !process.env.MAIL_ENCRYPTION_KEY) throw new Error('Auth tests require JWT_SECRET and MAIL_ENCRYPTION_KEY.');

const db = new PrismaClient();
const email = `${randomUUID()}@auth.invalid`;
const password = 'correct horse battery';
let app: INestApplication;
let userId: string;

async function tokenFor(purpose: string) {
  const rows = await db.outbox.findMany({ where: { user: { email } }, orderBy: { createdAt: 'desc' } });
  for (const row of rows) {
    const payload = JSON.parse(unseal(row.payload));
    if (payload.purpose === purpose) return payload.token as string;
  }
  throw new Error(`No ${purpose} token issued.`);
}

before(async () => { app = (await createApp()).app; await app.init(); });
after(async () => {
  await app?.close();
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});

test('register -> verify -> login -> protected call -> refresh rotation with replay detection -> logout', async () => {
  const server = app.getHttpServer();

  await request(server).post('/v1/auth/register').send({ email, password }).expect(202);
  await request(server).post('/v1/auth/register').send({ email, password }).expect(202); // idempotent, no enumeration
  userId = (await db.user.findUniqueOrThrow({ where: { email } })).id;

  // Unverified account cannot log in.
  await request(server).post('/v1/auth/login').send({ email, password }).expect(401);

  await request(server).post('/v1/auth/verify-email').send({ token: await tokenFor('verify') }).expect(204);

  const login = await request(server).post('/v1/auth/login').send({ email, password }).expect(200);
  const { accessToken, refreshToken, userId: loginUserId } = login.body;
  assert.equal(loginUserId, userId);

  // Protected endpoint works with a real bearer token and is user-scoped.
  const dashboard = await request(server).get('/v1/dashboard').set('Authorization', `Bearer ${accessToken}`).expect(200);
  assert.equal(dashboard.body.activityCount, 0);
  await request(server).get('/v1/dashboard').set('Authorization', 'Bearer not-a-token').expect(401);
  await request(server).get('/v1/dashboard').expect(401);

  // Create a persisted activity as the authenticated user.
  const activityId = randomUUID();
  await request(server).post('/v1/activities').set('Authorization', `Bearer ${accessToken}`)
    .send({ id: activityId, title: 'First verified run', sport: 'run', startedAt: new Date(Date.now() - 1000).toISOString(), timezone: 'UTC', distanceMeters: 5000, movingSeconds: 1500, elapsedSeconds: 1600 }).expect(201);
  const after = await request(server).get('/v1/dashboard').set('Authorization', `Bearer ${accessToken}`).expect(200);
  assert.equal(after.body.distanceMeters, 5000);

  // Refresh rotates the token; the old refresh token is single-use and replay revokes the family.
  const rotated = await request(server).post('/v1/auth/refresh').send({ refreshToken }).expect(200);
  assert.notEqual(rotated.body.refreshToken, refreshToken);
  await request(server).post('/v1/auth/refresh').send({ refreshToken }).expect(401);
  await request(server).post('/v1/auth/refresh').send({ refreshToken: rotated.body.refreshToken }).expect(401);

  // A fresh login session supports logout, after which its access token is rejected.
  const relogin = await request(server).post('/v1/auth/login').send({ email, password }).expect(200);
  await request(server).get('/v1/auth/sessions').set('Authorization', `Bearer ${relogin.body.accessToken}`).expect(200);
  await request(server).post('/v1/auth/logout').set('Authorization', `Bearer ${relogin.body.accessToken}`).expect(204);
  await request(server).get('/v1/auth/sessions').set('Authorization', `Bearer ${relogin.body.accessToken}`).expect(401);
});

test('password reset revokes existing sessions and rejects the old password', async () => {
  const server = app.getHttpServer();
  const session = await request(server).post('/v1/auth/login').send({ email, password }).expect(200);
  await request(server).post('/v1/auth/forgot-password').send({ email }).expect(202);
  const newPassword = 'a brand new passphrase';
  await request(server).post('/v1/auth/reset-password').send({ token: await tokenFor('reset'), password: newPassword }).expect(204);
  await request(server).get('/v1/dashboard').set('Authorization', `Bearer ${session.body.accessToken}`).expect(401);
  await request(server).post('/v1/auth/login').send({ email, password }).expect(401);
  await request(server).post('/v1/auth/login').send({ email, password: newPassword }).expect(200);
});
