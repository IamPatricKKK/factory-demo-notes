import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

describe('Items API', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    const orm = app.get(MikroORM);
    await orm.migrator.up();
    await orm.em.getConnection().execute('truncate table "item" restart identity');
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports healthy', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200, { status: 'ok' });
  });

  it('creates, reads, updates and deletes an item', async () => {
    const server = app.getHttpServer();

    const created = await request(server).post('/api/items').send({ title: 'Buy milk' }).expect(201);
    expect(created.body).toMatchObject({ id: 1, title: 'Buy milk', done: false });

    await request(server).get('/api/items').expect(200).expect((res) => {
      expect(res.body).toHaveLength(1);
    });

    const updated = await request(server).patch('/api/items/1').send({ done: true }).expect(200);
    expect(updated.body.done).toBe(true);

    await request(server).delete('/api/items/1').expect(204);
    await request(server).get('/api/items/1').expect(404);
  });

  it('rejects invalid input', () => {
    return request(app.getHttpServer()).post('/api/items').send({ title: '' }).expect(400);
  });
});
