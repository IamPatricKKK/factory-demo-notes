import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotesService } from './notes.service.js';
import { Note } from './note.entity.js';

describe('NotesService', () => {
  it('throws NotFoundException when the note does not exist', async () => {
    const findOne = vi.fn().mockResolvedValue(null);
    const em = { findOne } as unknown as EntityManager;
    const service = new NotesService(em);

    await expect(service.findOne(42)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns the note when found', async () => {
    const mockNote = { id: 1, title: 'Test Title', body: 'Test Body', createdAt: new Date() };
    const findOne = vi.fn().mockResolvedValue(mockNote);
    const em = { findOne } as unknown as EntityManager;
    const service = new NotesService(em);

    const result = await service.findOne(1);
    expect(result).toBe(mockNote);
    expect(findOne).toHaveBeenCalledWith(Note, 1);
  });

  it('finds notes sorted newest first', async () => {
    const mockNotes = [
      { id: 2, title: 'Second', body: 'Body 2', createdAt: new Date() },
      { id: 1, title: 'First', body: 'Body 1', createdAt: new Date() },
    ];
    const find = vi.fn().mockResolvedValue(mockNotes);
    const em = { find } as unknown as EntityManager;
    const service = new NotesService(em);

    const result = await service.findAll();
    expect(result).toBe(mockNotes);
    expect(find).toHaveBeenCalledWith(Note, {}, { orderBy: { createdAt: 'desc', id: 'desc' } });
  });

  it('creates and saves a new note', async () => {
    const createdNote = { id: 1, title: 'Title', body: 'Body' };
    const create = vi.fn().mockReturnValue(createdNote);
    const flush = vi.fn().mockResolvedValue(undefined);
    const em = { create, flush } as unknown as EntityManager;
    const service = new NotesService(em);

    const result = await service.create({ title: 'Title', body: 'Body' });
    expect(result).toBe(createdNote);
    expect(create).toHaveBeenCalledWith(Note, { title: 'Title', body: 'Body' });
    expect(flush).toHaveBeenCalled();
  });

  it('removes an existing note', async () => {
    const mockNote = { id: 1, title: 'Title', body: 'Body' };
    const findOne = vi.fn().mockResolvedValue(mockNote);
    const remove = vi.fn();
    const flush = vi.fn().mockResolvedValue(undefined);
    const em = { findOne, remove, flush } as unknown as EntityManager;
    const service = new NotesService(em);

    await service.remove(1);
    expect(remove).toHaveBeenCalledWith(mockNote);
    expect(flush).toHaveBeenCalled();
  });

  it('throws NotFoundException when removing a non-existent note', async () => {
    const findOne = vi.fn().mockResolvedValue(null);
    const em = { findOne } as unknown as EntityManager;
    const service = new NotesService(em);

    await expect(service.remove(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
