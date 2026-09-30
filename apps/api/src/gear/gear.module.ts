import { Body, Controller, Get, Module, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { Actor, Identity, IdentityGuard } from '../common/identity';
import { CollectionQuery, GearInput, GearPage, GearPatch, GearView } from '../training/training.dto';
import { GearService } from './gear.service';

@Controller('gear') @UseGuards(IdentityGuard) @ApiBearerAuth()
class GearController {
  constructor(private readonly service: GearService) {}
  @Get() @ApiOkResponse({ type: GearPage })
  list(@Actor() actor: Identity, @Query() query: CollectionQuery) { return this.service.list(actor.userId, query); }
  @Post() @ApiCreatedResponse({ type: GearView })
  create(@Actor() actor: Identity, @Body() body: GearInput) { return this.service.save(actor.userId, body); }
  @Patch(':id') @ApiOkResponse({ type: GearView })
  edit(@Actor() actor: Identity, @Param('id', ParseUUIDPipe) id: string, @Body() body: GearPatch) { return this.service.save(actor.userId, body, id); }
}
@Module({ controllers: [GearController], providers: [GearService, IdentityGuard] })
export class GearModule {}