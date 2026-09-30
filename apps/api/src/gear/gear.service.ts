import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Gear, Prisma } from '@prisma/client';
import { Database } from '../common/database';
import { assertVersion, lockUser } from '../training/activities.service';
import { CollectionQuery, GearInput, GearPatch } from '../training/training.dto';

export function gearView(gear: Gear, distance: number) {
  const { id, name, brand, type, openingMileageMeters, expectedLifeMeters, retiredAt, version } = gear;
  return { id, name, brand, type, openingMileageMeters, expectedLifeMeters, retiredAt: retiredAt?.toISOString() ?? null, version, usageMeters: openingMileageMeters + distance };
}
@Injectable()
export class GearService {
  constructor(private readonly db: Database) {}
  async list(userId: string, query: CollectionQuery) {
    return this.db.$transaction(async transaction => {
      const rows = await transaction.gear.findMany({ where: {
        userId, ...(query.cursor ? { id: { gt: query.cursor } } : {}),
        ...(query.status === 'all' ? {} : { retiredAt: query.status === 'archived' ? { not: null } : null }),
      }, orderBy: { id: 'asc' }, take: query.limit + 1 });
      const gear = rows.slice(0, query.limit);
      const usage = await transaction.activity.groupBy({ by: ['gearId'], where: { userId, source: 'manual', gearId: { in: gear.map(item => item.id) } }, _sum: { distanceMeters: true } });
      return { items: gear.map(item => gearView(item, usage.find(total => total.gearId === item.id)?._sum.distanceMeters ?? 0)), nextCursor: rows.length > query.limit ? gear.at(-1)!.id : null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }
  async save(userId: string, input: GearInput | GearPatch, id?: string) {
    return this.db.$transaction(async transaction => {
      await lockUser(transaction, userId);
      const previous = id ? await transaction.gear.findFirst({ where: { id, userId } }) : null;
      if (id && !previous) throw new NotFoundException();
      if (previous) assertVersion(previous.version, (input as GearPatch).expectedVersion);
      const { expectedVersion: _version, ...fields } = input as GearPatch;
      const values = { ...previous, ...fields };
      if (values.type === 'equipment' && (values.openingMileageMeters !== 0 || values.expectedLifeMeters != null)) throw new UnprocessableEntityException('Mileage baselines and lifespans apply only to shoes.');
      if (previous && values.type !== previous.type) throw new ConflictException('Equipment type cannot change.');
      if (!previous) {
        const body = input as GearInput;
        const existing = await transaction.gear.findFirst({ where: { id: body.id, userId } });
        if (existing) {
          if (existing.name !== body.name || existing.type !== body.type || existing.brand !== body.brand || existing.openingMileageMeters !== body.openingMileageMeters || existing.expectedLifeMeters !== (body.expectedLifeMeters ?? null)) throw new ConflictException('ID already used for different gear.');
          const usage = await transaction.activity.aggregate({ where: { userId, gearId: existing.id, source: 'manual' }, _sum: { distanceMeters: true } });
          return gearView(existing, usage._sum.distanceMeters ?? 0);
        }
      }
      const gear = previous
        ? await transaction.gear.update({ where: { id: previous.id }, data: { ...fields, version: { increment: 1 } } })
        : await transaction.gear.create({ data: { ...(input as GearInput), userId } });
      const usage = await transaction.activity.aggregate({ where: { userId, gearId: gear.id, source: 'manual' }, _sum: { distanceMeters: true } });
      return gearView(gear, usage._sum.distanceMeters ?? 0);
    });
  }
}