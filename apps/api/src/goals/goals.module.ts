import { Body, Controller, Get, Module, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Actor, Identity, IdentityGuard } from '../common/identity';
import { CollectionQuery, GoalInput, GoalPage, GoalPatch, GoalView } from '../training/training.dto';
import { GoalsService } from './goals.service';

@Controller('goals') @UseGuards(IdentityGuard) @ApiBearerAuth()
class GoalsController {
  constructor(private readonly service: GoalsService) {}
  @Get() @ApiOkResponse({ type: GoalPage })
  list(@Actor() actor: Identity, @Query() query: CollectionQuery) { return this.service.list(actor.userId, query); }
  @Post() @ApiCreatedResponse({ type: GoalView })
  create(@Actor() actor: Identity, @Body() body: GoalInput) { return this.service.save(actor.userId, body); }
  @Patch(':id') @ApiOkResponse({ type: GoalView })
  edit(@Actor() actor: Identity, @Param('id', ParseUUIDPipe) id: string, @Body() body: GoalPatch) { return this.service.save(actor.userId, body, id); }
}
@Module({ controllers: [GoalsController], providers: [GoalsService, IdentityGuard] })
export class GoalsModule {}