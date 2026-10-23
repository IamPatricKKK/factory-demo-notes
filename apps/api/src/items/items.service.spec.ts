import { NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ItemsService } from './items.service.js';

describe('ItemsService', () => {
  it('throws NotFoundException when the item does not exist', async () => {
    const em = { findOne: vi.fn().mockResolvedValue(null) } as unknown as EntityManager;
    const service = new ItemsService(em);

    await expect(service.findOne(42)).rejects.toBeInstanceOf(NotFoundException);
  });
});
