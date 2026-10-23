import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Note } from './note.entity.js';
import { CreateNoteDto } from './note.dto.js';

@Injectable()
export class NotesService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(Note, {}, { orderBy: { createdAt: 'desc', id: 'desc' } });
  }

  async findOne(id: number) {
    const note = await this.em.findOne(Note, id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async create(dto: CreateNoteDto) {
    const note = this.em.create(Note, { title: dto.title, body: dto.body });
    await this.em.flush();
    return note;
  }

  async remove(id: number) {
    const note = await this.findOne(id);
    this.em.remove(note);
    await this.em.flush();
  }
}
