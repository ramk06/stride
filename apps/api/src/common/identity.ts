import { CanActivate, createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AccessService } from '../access/access.service';

export type Identity = { userId: string; sessionId?: string };
export type IdentityRequest = Request & { actor: Identity };
export const Actor = createParamDecorator((_data: unknown, context: ExecutionContext): Identity => context.switchToHttp().getRequest<IdentityRequest>().actor);

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly access: AccessService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IdentityRequest>();
    request.actor = await this.access.authenticate(request.headers.authorization);
    return true;
  }
}