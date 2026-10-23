import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import config from './mikro-orm.config.js';
import { HealthController } from './health/health.controller.js';
import { NotesModule } from './notes/notes.module.js';

@Module({
  imports: [
    MikroOrmModule.forRoot(config),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    NotesModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
