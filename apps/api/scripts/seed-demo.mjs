import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';

if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED !== 'yes') throw new Error('Explicitly set ALLOW_DEMO_SEED=yes for local synthetic data only.');
const database = new PrismaClient();
try {
  const userId = randomUUID();
  await database.user.create({ data: {
    id: userId, email: `${userId}@demo.invalid`, passwordHash: 'disabled-demo-account',
    profile: { create: { displayName: 'Synthetic Demo Runner' } },
    activities: { create: { title: 'Explicit synthetic seed', sport: 'run', startedAt: new Date(), timezone: 'UTC', distanceMeters: 5000, movingSeconds: 1800, elapsedSeconds: 1800 } },
  } });
  console.log(`Created isolated synthetic owner ${userId}. No login credential or session was created.`);
} finally { await database.$disconnect(); }