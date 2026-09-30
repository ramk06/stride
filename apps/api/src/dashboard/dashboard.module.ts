import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Actor, Identity, IdentityGuard } from '../common/identity';
import { DashboardView } from '../training/training.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard') @UseGuards(IdentityGuard) @ApiBearerAuth()
class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get() @ApiOkResponse({ type: DashboardView })
  get(@Actor() actor: Identity) { return this.service.get(actor.userId); }
}
@Module({ controllers: [DashboardController], providers: [DashboardService, IdentityGuard] })
export class DashboardModule {}