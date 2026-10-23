import { defineEntity, p } from '@mikro-orm/core';

const NoteSchema = defineEntity({
  name: 'Note',
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    body: p.string(),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Note extends NoteSchema.class {}
NoteSchema.setClass(Note);
