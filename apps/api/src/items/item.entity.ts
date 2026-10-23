import { defineEntity, p } from '@mikro-orm/core';

const ItemSchema = defineEntity({
  name: 'Item',
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    done: p.boolean().default(false),
    createdAt: p.datetime().onCreate(() => new Date()),
  },
});

export class Item extends ItemSchema.class {}
ItemSchema.setClass(Item);
