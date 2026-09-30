import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { Database } from '../common/database';
import { profileView } from '../profile/profile.service';
import { activityView } from '../training/activities.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: Database) {}
  async get(userId: string, now = new Date()) {
    return this.db.$transaction(async transaction => {
      const profile = await transaction.profile.findUnique({ where: { userId } });
      if (!profile) throw new NotFoundException();
      const start = DateTime.fromJSDate(now, { zone: profile.timezone }).startOf('week');
      const end = start.plus({ weeks: 1 });
      const totals = await transaction.activity.aggregate({ where: { userId, source: 'manual', sport: { in: ['run', 'trail'] }, startedAt: { gte: start.toJSDate(), lt: end.toJSDate() } }, _sum: { distanceMeters: true, movingSeconds: true }, _count: true });
      const latest = await transaction.activity.findFirst({ where: { userId, source: 'manual' }, orderBy: [{ startedAt: 'desc' }, { id: 'desc' }] });
      return { distanceMeters: totals._sum.distanceMeters ?? 0, movingSeconds: totals._sum.movingSeconds ?? 0, activityCount: totals._count,
        periodStart: start.toUTC().toISO()!, periodEnd: end.toUTC().toISO()!, asOf: now.toISOString(), profile: profileView(profile), latest: latest ? activityView(latest) : null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }
}