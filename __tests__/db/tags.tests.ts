import { PrismaClient, Tag, User } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DbType, getClient } from '../../src/db/Database';
import { NoSuchResource } from '../../src/utils/errors';

const prismaMock = mockDeep<PrismaClient>();
const db = getClient(DbType.MOCK_PRISMA, prismaMock);
afterEach(() => mockReset(prismaMock));

const timestamp = new Date();
const tag: Tag = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Cafeteria',
  description: 'Food is good',
};

describe('Tags client remove', () => {
  test('Should remove existing user', async () => {
    prismaMock.tag.delete.mockResolvedValue(tag);
    expect(await db.access.tags.remove(1)).toMatchObject({
      id: 1,
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });

  test('Should throw error when tag is not found', async () => {
    prismaMock.tag.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.access.tags.remove(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Tags client get by id', () => {
  test('Should return tag by its id', async () => {
    prismaMock.tag.findFirstOrThrow.mockResolvedValue(tag);
    await expect(db.access.tags.select(1)).resolves.toMatchObject({
      id: 1,
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });

  test('Should throw error when no tag is found', async () => {
    prismaMock.tag.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(db.access.tags.select(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Tags client get all', () => {
  test('Should return existing tags', async () => {
    prismaMock.tag.findMany.mockResolvedValue([tag]);
    const result = await db.access.tags.all();

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no tags exist', async () => {
    prismaMock.tag.findMany.mockResolvedValue([]);
    const result = await db.access.tags.all();

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(0);
  });
});

describe('Tags client create', () => {
  test('Should create new user', async () => {
    prismaMock.tag.create.mockResolvedValue({ ...tag, name: 'Cafeteria' });
    const fields = {
      name: 'Cafeteria',
      description: 'Food is good',
    };
    await expect(db.access.tags.create(fields)).resolves.toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });
});
