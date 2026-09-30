import { Global, Injectable, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class Database extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() { super({ transactionOptions: { maxWait: 10000, timeout: 10000 } }); }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}

@Global()
@Module({ providers: [Database], exports: [Database] })
export class DatabaseModule {}