import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

describe('Notes API', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app);
    await app.init();
    const orm = app.get(MikroORM);
    await orm.migrator.up();
    await orm.em.getConnection().execute('truncate table "note" restart identity');
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports healthy', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200, { status: 'ok' });
  });

  it('creates, reads, and deletes notes sorted newest first', async () => {
    const server = app.getHttpServer();

    const created1 = await request(server)
      .post('/api/notes')
      .send({ title: 'First Note', body: 'First Body' })
      .expect(201);
    expect(created1.body).toMatchObject({ id: 1, title: 'First Note', body: 'First Body' });
    expect(created1.body.createdAt).toBeDefined();

    const created2 = await request(server)
      .post('/api/notes')
      .send({ title: 'Second Note', body: 'Second Body' })
      .expect(201);
    expect(created2.body).toMatchObject({ id: 2, title: 'Second Note', body: 'Second Body' });

    const listRes = await request(server).get('/api/notes').expect(200);
    expect(listRes.body).toHaveLength(2);
    expect(listRes.body[0].title).toBe('Second Note');
    expect(listRes.body[1].title).toBe('First Note');

    await request(server).delete('/api/notes/1').expect(204);

    const afterDelete = await request(server).get('/api/notes').expect(200);
    expect(afterDelete.body).toHaveLength(1);
    expect(afterDelete.body[0].id).toBe(2);

    await request(server).delete('/api/notes/1').expect(404);
  });

  it('rejects invalid input', async () => {
    const server = app.getHttpServer();

    await request(server).post('/api/notes').send({ title: '', body: 'Valid body' }).expect(400);
    await request(server).post('/api/notes').send({ title: 'Valid title', body: '' }).expect(400);
    await request(server).post('/api/notes').send({ title: 'Valid title' }).expect(400);
    await request(server).post('/api/notes').send({ body: 'Valid body' }).expect(400);
    await request(server).post('/api/notes').send({}).expect(400);
    await request(server)
      .post('/api/notes')
      .send({ title: 'Valid', body: 'Valid', unknownField: true })
      .expect(400);
  });
});
