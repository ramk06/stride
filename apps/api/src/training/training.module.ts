import { Body, Controller, Delete, Get, HttpCode, Module, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Actor, Identity, IdentityGuard } from '../common/identity';
import { ActivitiesService } from './activities.service';
import { ActivityInput, ActivityPage, ActivityPatch, ActivityQuery, ActivityView, VersionDto } from './training.dto';

@Controller('activities') @UseGuards(IdentityGuard) @ApiBearerAuth()
class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}
  @Get() @ApiOkResponse({ type: ActivityPage })
  list(@Actor() actor: Identity, @Query() query: ActivityQuery) { return this.service.list(actor.userId, query); }
  @Get(':id') @ApiOkResponse({ type: ActivityView })
  detail(@Actor() actor: Identity, @Param('id', ParseUUIDPipe) id: string) { return this.service.detail(actor.userId, id); }
  @Post() @ApiCreatedResponse({ type: ActivityView })
  create(@Actor() actor: Identity, @Body() body: ActivityInput) { return this.service.save(actor.userId, body); }
  @Patch(':id') @ApiOkResponse({ type: ActivityView })
  edit(@Actor() actor: Identity, @Param('id', ParseUUIDPipe) id: string, @Body() body: ActivityPatch) { return this.service.save(actor.userId, body, id); }
  @Delete(':id') @HttpCode(204)
  remove(@Actor() actor: Identity, @Param('id', ParseUUIDPipe) id: string, @Body() body: VersionDto) { return this.service.remove(actor.userId, id, body.expectedVersion); }
}
@Module({ controllers: [ActivitiesController], providers: [ActivitiesService, IdentityGuard] })
export class TrainingModule {}