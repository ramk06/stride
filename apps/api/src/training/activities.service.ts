import { ConflictException, Injectable, NotFoundException, PreconditionFailedException, UnprocessableEntityException } from '@nestjs/common';
import { Activity, Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { Database } from '../common/database';
import { ActivityInput, ActivityPatch, ActivityQuery } from './training.dto';

export function activityView(activity: Activity) {
  const { id, title, sport, startedAt, timezone, distanceMeters, movingSeconds, elapsedSeconds, notes, gearId, version, source } = activity;
  return { id, title, sport, startedAt: startedAt.toISOString(), timezone, distanceMeters, movingSeconds, elapsedSeconds, notes, gearId, version, source, routeAvailable: false, splitsAvailable: false };
}
export function assertVersion(actual: number, expected: number) {
  if (actual !== expected) throw new PreconditionFailedException('Changed on another device. Reload before saving.');
}
export async function lockUser(transaction: Prisma.TransactionClient, userId: string) {
  const rows = await transaction.$queryRaw<Array<{ id: string }>>`SELECT id FROM "User" WHERE id = ${userId}::uuid FOR UPDATE`;
  if (!rows.length) throw new NotFoundException();
}

@Injectable()
export class ActivitiesService {
  constructor(private readonly db: Database) {}
  async list(userId: string, query: ActivityQuery) {
    let cursor: { startedAt: string; id: string } | undefined;
    if (query.cursor) {
      try {
        cursor = JSON.parse(Buffer.from(query.cursor, 'base64url').toString());
        if (!cursor || !isUUID(cursor.id) || !Number.isFinite(Date.parse(cursor.startedAt))) throw new Error();
      } catch { throw new UnprocessableEntityException('Invalid cursor.'); }
    }
    const items = await this.db.activity.findMany({ where: {
      userId, sport: query.sport, ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
      ...(cursor ? { OR: [{ startedAt: { lt: new Date(cursor.startedAt) } }, { startedAt: new Date(cursor.startedAt), id: { lt: cursor.id } }] } : {}),
    }, orderBy: [{ startedAt: 'desc' }, { id: 'desc' }], take: query.limit + 1 });
    const more = items.length > query.limit;
    const page = items.slice(0, query.limit);
    const last = page.at(-1);
    return { items: page.map(activityView), nextCursor: more && last ? Buffer.from(JSON.stringify({ startedAt: last.startedAt, id: last.id })).toString('base64url') : null };
  }
  async detail(userId: string, id: string) {
    const activity = await this.db.activity.findFirst({ where: { id, userId } });
    if (!activity) throw new NotFoundException();
    return activityView(activity);
  }
  async save(userId: string, input: ActivityInput | ActivityPatch, id?: string) {
    return this.db.$transaction(async transaction => {
      await lockUser(transaction, userId);
      const previous = id ? await transaction.activity.findFirst({ where: { id, userId } }) : null;
      if (id && !previous) throw new NotFoundException();
      if (previous) assertVersion(previous.version, (input as ActivityPatch).expectedVersion);
      const { expectedVersion: _version, id: inputId, ...fields } = input as ActivityPatch & { id?: string };
      const values = { ...previous, ...fields };
      if (values.elapsedSeconds! < values.movingSeconds! || new Date(values.startedAt!) > new Date()) throw new UnprocessableEntityException('Check activity time and duration.');
      if (values.gearId) {
        const gear = await transaction.gear.findFirst({ where: { id: values.gearId, userId } });
        if (!gear) throw new NotFoundException();
        if (gear.retiredAt && (!previous || previous.gearId !== gear.id)) throw new ConflictException('Retired gear cannot be newly assigned.');
      }
      if (previous) return activityView(await transaction.activity.update({ where: { id: previous.id }, data: { ...fields, version: { increment: 1 } } }));
      const existing = await transaction.activity.findFirst({ where: { id: inputId, userId } });
      if (existing) {
        const supplied = input as ActivityInput;
        if (existing.title !== supplied.title || existing.sport !== supplied.sport || existing.startedAt.toISOString() !== new Date(supplied.startedAt).toISOString() || existing.timezone !== supplied.timezone || existing.distanceMeters !== supplied.distanceMeters || existing.movingSeconds !== supplied.movingSeconds || existing.elapsedSeconds !== supplied.elapsedSeconds || existing.notes !== (supplied.notes ?? '') || existing.gearId !== (supplied.gearId ?? null)) throw new ConflictException('ID already used for different activity.');
        return activityView(existing);
      }
      return activityView(await transaction.activity.create({ data: { ...(input as ActivityInput), userId } }));
    });
  }
  async remove(userId: string, id: string, expectedVersion: number) {
    await this.db.$transaction(async transaction => {
      await lockUser(transaction, userId);
      const activity = await transaction.activity.findFirst({ where: { id, userId } });
      if (!activity) throw new NotFoundException();
      assertVersion(activity.version, expectedVersion);
      await transaction.activity.delete({ where: { id } });
    });
  }
}