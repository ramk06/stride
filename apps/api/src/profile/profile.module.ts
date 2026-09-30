import { Body, Controller, Get, Module, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Actor, Identity, IdentityGuard } from '../common/identity';
import { ProfileInput, ProfileView } from '../training/training.dto';
import { ProfileService } from './profile.service';

@Controller('users/me/profile') @UseGuards(IdentityGuard) @ApiBearerAuth()
class ProfileController {
  constructor(private readonly service: ProfileService) {}
  @Get() @ApiOkResponse({ type: ProfileView })
  get(@Actor() actor: Identity) { return this.service.get(actor.userId); }
  @Patch() @ApiOkResponse({ type: ProfileView })
  save(@Actor() actor: Identity, @Body() body: ProfileInput) { return this.service.save(actor.userId, body); }
}
@Module({ controllers: [ProfileController], providers: [ProfileService, IdentityGuard] })
export class ProfileModule {}