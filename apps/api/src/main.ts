import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MikroORM } from '@mikro-orm/core';
import { AppModule } from './app.module.js';
import { setupApp } from './setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);

  const webDir = process.env.WEB_DIR;
  if (webDir && existsSync(webDir)) {
    app.useStaticAssets(webDir);
    app.use((req: { method: string; path: string }, res: { sendFile: (p: string) => void }, next: () => void) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(join(webDir, 'index.html'));
      next();
    });
  }

  if (process.env.RUN_MIGRATIONS !== 'false') {
    await app.get(MikroORM).migrator.up();
  }
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
