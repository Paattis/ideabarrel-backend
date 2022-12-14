import { PrismaClient, Tag, User } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DbType, dbMock } from '../../src/db/Database';
import { NoSuchResource } from '../../src/utils/errors';

const prismaMock = mockDeep<PrismaClient>();
const db = dbMock(DbType.MOCK_PRISMA, prismaMock);
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
    expect(await db.tags.remove(1)).toMatchObject({
      id: 1,
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });

  test('Should throw error when tag is not found', async () => {
    prismaMock.tag.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.tags.remove(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Tags client get by id', () => {
  test('Should return tag by its id', async () => {
    prismaMock.tag.findFirstOrThrow.mockResolvedValue(tag);
    await expect(db.tags.select(1)).resolves.toMatchObject({
      id: 1,
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });

  test('Should throw error when no tag is found', async () => {
    prismaMock.tag.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(db.tags.select(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Tags client get all', () => {
  test('Should return existing tags', async () => {
    prismaMock.tag.findMany.mockResolvedValue([tag]);
    const result = await db.tags.all();

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no tags exist', async () => {
    prismaMock.tag.findMany.mockResolvedValue([]);
    const result = await db.tags.all();

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
    await expect(db.tags.create(fields)).resolves.toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });
});
