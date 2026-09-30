import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Session } from '@prisma/client';
import * as argon from 'argon2';
import * as jwt from 'jsonwebtoken';
import { isUUID } from 'class-validator';
import { Database } from '../common/database';
import { digest, opaque, required, seal } from './credentials';
import { LoginDto, RegisterDto } from './access.dto';

const hashPassword = (password: string) => argon.hash(password, { type: argon.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 });
const denied = () => new UnauthorizedException('Credentials invalid, unverified or expired.');
async function matches(hash: string, password: string) {
  try { return await argon.verify(hash, password); } catch { return false; }
}

@Injectable()
export class AccessService {
  private readonly dummy = hashPassword(opaque());
  constructor(private readonly db: Database) {}
  async action(transaction: Prisma.TransactionClient, userId: string, purpose: string) {
    const token = opaque();
    const expiresAt = new Date(Date.now() + 30 * 60_000);
    await transaction.actionToken.create({ data: { hash: digest(token), userId, purpose, expiresAt } });
    await transaction.outbox.create({ data: { userId, kind: 'mail', payload: seal(JSON.stringify({ purpose, token, expiresAt })) } });
  }
  async register(input: RegisterDto) {
    const passwordHash = await hashPassword(input.password);
    try {
      await this.db.$transaction(async transaction => {
        const user = await transaction.user.create({ data: { email: input.email, passwordHash, profile: { create: {} } } });
        await this.action(transaction, user.id, 'verify');
      });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error;
    }
  }
  async requestAction(email: string, purpose: 'verify' | 'reset') {
    const user = await this.db.user.findUnique({ where: { email } });
    if (user && (purpose === 'reset' || !user.verifiedAt)) await this.db.$transaction(transaction => this.action(transaction, user.id, purpose));
  }
  async consumeAction(token: string, purpose: string, password?: string) {
    const passwordHash = password ? await hashPassword(password) : undefined;
    await this.db.$transaction(async transaction => {
      const action = await transaction.actionToken.findUnique({ where: { hash: digest(token) } });
      if (!action || action.purpose !== purpose) throw denied();
      await transaction.$queryRaw`SELECT id FROM "User" WHERE id = ${action.userId}::uuid FOR UPDATE`;
      const consumed = await transaction.actionToken.updateMany({ where: { hash: action.hash, consumedAt: null, expiresAt: { gt: new Date() } }, data: { consumedAt: new Date() } });
      if (!consumed.count) throw denied();
      await transaction.user.update({ where: { id: action.userId }, data: purpose === 'verify' ? { verifiedAt: new Date() } : { passwordHash } });
      if (purpose === 'reset') await transaction.session.updateMany({ where: { userId: action.userId, revokedAt: null }, data: { revokedAt: new Date() } });
      await transaction.actionToken.updateMany({ where: { userId: action.userId, purpose, consumedAt: null }, data: { consumedAt: new Date() } });
    });
  }
  async login(input: LoginDto) {
    const user = await this.db.user.findUnique({ where: { email: input.email } });
    const valid = await matches(user?.passwordHash ?? await this.dummy, input.password);
    if (!user || !valid || !user.verifiedAt) throw denied();
    const token = opaque();
    const session = await this.db.$transaction(async transaction => {
      await transaction.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id}::uuid FOR UPDATE`;
      const current = await transaction.user.findUniqueOrThrow({ where: { id: user.id } });
      if (current.passwordHash !== user.passwordHash) throw denied();
      return transaction.session.create({ data: { userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400_000), tokens: { create: { hash: digest(token) } } } });
    });
    return this.pair(session, token);
  }
  pair(session: Session, refreshToken: string) {
    return { accessToken: jwt.sign({ sid: session.id }, required('JWT_SECRET'), { algorithm: 'HS256', subject: session.userId, issuer: 'stride', audience: 'stride-mobile', expiresIn: 600 }), refreshToken, userId: session.userId, expiresIn: 600 };
  }
  async refresh(token: string) {
    const nextToken = opaque();
    const session = await this.db.$transaction(async transaction => {
      const previous = await transaction.refreshToken.findUnique({ where: { hash: digest(token) } });
      if (!previous) return null;
      await transaction.$queryRaw`SELECT id FROM "Session" WHERE id = ${previous.sessionId}::uuid FOR UPDATE`;
      const current = await transaction.session.findUniqueOrThrow({ where: { id: previous.sessionId } });
      if (current.revokedAt || current.expiresAt <= new Date()) return null;
      const updated = await transaction.refreshToken.updateMany({ where: { hash: previous.hash, consumedAt: null }, data: { consumedAt: new Date() } });
      if (!updated.count) {
        await transaction.session.update({ where: { id: current.id }, data: { revokedAt: new Date() } });
        return null;
      }
      await transaction.refreshToken.create({ data: { hash: digest(nextToken), sessionId: current.id } });
      return current;
    });
    if (!session) throw denied();
    return this.pair(session, nextToken);
  }
  async authenticate(header?: string) {
    let claims: jwt.JwtPayload;
    try {
      if (!header?.startsWith('Bearer ')) throw denied();
      claims = jwt.verify(header.slice(7), required('JWT_SECRET'), { algorithms: ['HS256'], issuer: 'stride', audience: 'stride-mobile' }) as jwt.JwtPayload;
      if (typeof claims.sid !== 'string' || typeof claims.sub !== 'string' || !isUUID(claims.sid) || !isUUID(claims.sub)) throw denied();
    } catch { throw denied(); }
    const session = await this.db.session.findFirst({ where: { id: claims.sid, userId: claims.sub, revokedAt: null, expiresAt: { gt: new Date() } } });
    if (!session) throw denied();
    return { userId: session.userId, sessionId: session.id };
  }
  async confirm(userId: string, password: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user || !await matches(user.passwordHash, password)) throw denied();
  }
  async revoke(userId: string, id: string, missingAllowed = false) {
    const result = await this.db.session.updateMany({ where: { id, userId }, data: { revokedAt: new Date() } });
    if (!result.count && !missingAllowed) throw new NotFoundException();
  }
}
