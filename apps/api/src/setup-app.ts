import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

export function setupApp(app: INestApplication) {
  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();
}
