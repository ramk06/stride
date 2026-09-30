import { Injectable, NotFoundException } from '@nestjs/common';
import { Profile } from '@prisma/client';
import { Database } from '../common/database';
import { assertVersion, lockUser } from '../training/activities.service';
import { ProfileInput } from '../training/training.dto';

export function profileView(profile: Profile) {
  const { displayName, units, timezone, experience, notifications, version } = profile;
  return { displayName, units, timezone, experience, notifications, version };
}
@Injectable()
export class ProfileService {
  constructor(private readonly db: Database) {}
  async get(userId: string) {
    const profile = await this.db.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException();
    return profileView(profile);
  }
  async save(userId: string, body: ProfileInput) {
    return this.db.$transaction(async transaction => {
      await lockUser(transaction, userId);
      const profile = await transaction.profile.findUnique({ where: { userId } });
      if (!profile) throw new NotFoundException();
      assertVersion(profile.version, body.expectedVersion);
      const { expectedVersion: _version, ...data } = body;
      return profileView(await transaction.profile.update({ where: { userId }, data: { ...data, version: { increment: 1 } } }));
    });
  }
}