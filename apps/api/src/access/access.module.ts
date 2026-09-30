import { Body, Controller, Delete, Get, Global, HttpCode, Module, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Database } from '../common/database';
import { Actor, Identity, IdentityGuard } from '../common/identity';
import { AccessService } from './access.service';
import { EmailDto, LoginDto, PasswordDto, RefreshDto, RegisterDto, ResetDto, SessionView, TokenDto, TokenPair } from './access.dto';

@ApiTags('auth') @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Controller('auth')
class AccessController {
  constructor(private readonly access: AccessService, private readonly db: Database) {}
  @Post('register') @HttpCode(202)
  register(@Body() body: RegisterDto) { return this.access.register(body); }
  @Post('verify-email') @HttpCode(204)
  verify(@Body() body: TokenDto) { return this.access.consumeAction(body.token, 'verify'); }
  @Post('resend-verification') @HttpCode(202)
  resend(@Body() body: EmailDto) { return this.access.requestAction(body.email, 'verify'); }
  @Post('forgot-password') @HttpCode(202)
  forgot(@Body() body: EmailDto) { return this.access.requestAction(body.email, 'reset'); }
  @Post('reset-password') @HttpCode(204)
  reset(@Body() body: ResetDto) { return this.access.consumeAction(body.token, 'reset', body.password); }
  @Post('login') @HttpCode(200) @ApiOkResponse({ type: TokenPair })
  login(@Body() body: LoginDto) { return this.access.login(body); }
  @Post('refresh') @HttpCode(200) @ApiOkResponse({ type: TokenPair })
  refresh(@Body() body: RefreshDto) { return this.access.refresh(body.refreshToken); }
  @Post('logout') @HttpCode(204) @UseGuards(IdentityGuard) @ApiBearerAuth()
  logout(@Actor() actor: Identity) { return this.access.revoke(actor.userId, actor.sessionId!, true); }
  @Get('sessions') @UseGuards(IdentityGuard) @ApiBearerAuth() @ApiOkResponse({ type: [SessionView] })
  async sessions(@Actor() actor: Identity) {
    const sessions = await this.db.session.findMany({ where: { userId: actor.userId, revokedAt: null, expiresAt: { gt: new Date() } }, select: { id: true, createdAt: true, expiresAt: true }, orderBy: { createdAt: 'desc' } });
    return sessions.map(session => ({ ...session, current: session.id === actor.sessionId }));
  }
  @Delete('sessions/:id') @HttpCode(204) @UseGuards(IdentityGuard) @ApiBearerAuth()
  async revoke(@Actor() actor: Identity, @Param('id', ParseUUIDPipe) id: string, @Body() body: PasswordDto) {
    await this.access.confirm(actor.userId, body.password);
    await this.access.revoke(actor.userId, id);
  }
}
@Global() @Module({ controllers: [AccessController], providers: [AccessService, IdentityGuard], exports: [AccessService, IdentityGuard] })
export class AccessModule {}
