import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { Note } from './notes/note.entity.js';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL ?? 'postgres://app:app@localhost:5432/app',
  entities: [Note],
  extensions: [Migrator],
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
});
