import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Item } from './item.entity.js';
import { CreateItemDto, UpdateItemDto } from './item.dto.js';

@Injectable()
export class ItemsService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Item, {}, { orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const item = await this.em.findOne(Item, id);
    if (!item) throw new NotFoundException(`Item ${id} not found`);
    return item;
  }

  async create(dto: CreateItemDto) {
    const item = this.em.create(Item, { title: dto.title });
    await this.em.flush();
    return item;
  }

  async update(id: number, dto: UpdateItemDto) {
    const item = await this.findOne(id);
    this.em.assign(item, dto);
    await this.em.flush();
    return item;
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    this.em.remove(item);
    await this.em.flush();
  }
}
