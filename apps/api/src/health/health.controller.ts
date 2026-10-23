import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { EntityManager } from '@mikro-orm/postgresql';

@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(private readonly em: EntityManager) {}

  @Get()
  async check() {
    await this.em.getConnection().execute('select 1');
    return { status: 'ok' };
  }
}
