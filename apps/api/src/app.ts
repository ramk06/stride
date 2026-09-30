import 'reflect-metadata';
import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { APP_GUARD, NestFactory } from '@nestjs/core';
import { ApiProperty, ApiOkResponse, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import helmet from 'helmet';
import { Database, DatabaseModule } from './common/database';
import { Errors, validation } from './common/http';
import { TrainingModule } from './training/training.module';
import { GearModule } from './gear/gear.module';
import { GoalsModule } from './goals/goals.module';
import { ProfileModule } from './profile/profile.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AccessModule } from './access/access.module';
import { checkKeys } from './access/credentials';

class ConnectionStatus {
  @ApiProperty() status!: string;
  @ApiProperty() reason!: string;
  @ApiProperty() aiEnabled!: boolean;
}
@Controller()
class OperationsController {
  constructor(private readonly db: Database) {}
  @Get('health') async ready() { await this.db.$queryRaw`SELECT 1`; return { status: 'ok', accountAccess: 'enabled' }; }
  @Get('strava/connection') @ApiOkResponse({ type: ConnectionStatus })
  connection() { return { status: 'disabled', reason: 'Written product, storage, analytics and capacity approval and server credentials are not configured.', aiEnabled: false }; }
}
@Module({ imports: [DatabaseModule, AccessModule, TrainingModule, GearModule, GoalsModule, ProfileModule, DashboardModule, ThrottlerModule.forRoot([{ ttl: 60_000, limit: 180 }])], controllers: [OperationsController], providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }] })
export class AppModule {}
export function configure(app: INestApplication) {
  checkKeys();
  app.use(helmet());
  app.enableCors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:8082' });
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(validation());
  app.useGlobalFilters(new Errors());
  const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Stride').setVersion('1').addBearerAuth().build());
  SwaggerModule.setup('v1/docs', app, document);
  return document;
}
export async function createApp() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  app.enableShutdownHooks();
  const document = configure(app);
  return { app, document };
}