import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Goal, Prisma } from '@prisma/client';
import { Database } from '../common/database';
import { assertVersion, lockUser } from '../training/activities.service';
import { CollectionQuery, GoalInput, GoalPatch } from '../training/training.dto';
import { goalPeriod, validateCalendar } from './calendar';

async function view(transaction: Prisma.TransactionClient, goal: Goal, now: Date) {
  const period = goalPeriod(goal, now);
  const totals = await transaction.activity.aggregate({ where: {
    userId: goal.userId, source: 'manual', sport: { in: ['run', 'trail'] }, startedAt: { gte: period.start, lt: period.end },
  }, _sum: { distanceMeters: true }, _count: true, _max: { distanceMeters: true } });
  const { id, title, type, target, timezone, startsOn, endsOn, archivedAt, version } = goal;
  return { id, title, type, target, period: goal.period, timezone, startsOn, endsOn, archivedAt: archivedAt?.toISOString() ?? null, version,
    progress: type === 'distance' ? totals._sum.distanceMeters ?? 0 : type === 'count' ? totals._count : totals._max.distanceMeters ?? 0,
    periodStart: period.start.toISOString(), periodEnd: period.end.toISOString(), asOf: now.toISOString(),
  };
}
@Injectable()
export class GoalsService {
  constructor(private readonly db: Database) {}
  async list(userId: string, query: CollectionQuery) {
    return this.db.$transaction(async transaction => {
      const rows = await transaction.goal.findMany({ where: {
        userId, ...(query.cursor ? { id: { gt: query.cursor } } : {}),
        ...(query.status === 'all' ? {} : { archivedAt: query.status === 'archived' ? { not: null } : null }),
      }, orderBy: { id: 'asc' }, take: query.limit + 1 });
      const goals = rows.slice(0, query.limit);
      const now = new Date();
      const items = await Promise.all(goals.map(goal => view(transaction, goal, now)));
      return { items, nextCursor: rows.length > query.limit ? goals.at(-1)!.id : null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }
  async save(userId: string, input: GoalInput | GoalPatch, id?: string) {
    return this.db.$transaction(async transaction => {
      await lockUser(transaction, userId);
      const previous = id ? await transaction.goal.findFirst({ where: { id, userId } }) : null;
      if (id && !previous) throw new NotFoundException();
      if (previous) assertVersion(previous.version, (input as GoalPatch).expectedVersion);
      const { expectedVersion: _version, ...fields } = input as GoalPatch;
      validateCalendar({ ...previous, ...fields } as GoalInput);
      if (!previous) {
        const body = input as GoalInput;
        const existing = await transaction.goal.findFirst({ where: { id: body.id, userId } });
        if (existing) {
          if (existing.title !== body.title || existing.type !== body.type || existing.target !== body.target || existing.period !== body.period || existing.timezone !== body.timezone || existing.startsOn !== body.startsOn || existing.endsOn !== body.endsOn) throw new ConflictException('ID already used for different goal.');
          return view(transaction, existing, new Date());
        }
      }
      const goal = previous
        ? await transaction.goal.update({ where: { id: previous.id }, data: { ...fields, version: { increment: 1 } } })
        : await transaction.goal.create({ data: { ...(input as GoalInput), userId } });
      return view(transaction, goal, new Date());
    });
  }
}