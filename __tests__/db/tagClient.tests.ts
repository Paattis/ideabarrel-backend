import { Tag, User } from '@prisma/client';
import tagsClient from '../../src/db/tags';
import {
  MockPrismaContext,
  PrismaContext,
  createMockContext,
  swapToAppContext,
} from '../../src/db/context';
import { NoSuchResource } from '../../src/utils/errors';

let mockCtx: MockPrismaContext;
let ctx: PrismaContext;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as PrismaContext;
});

afterAll(() => {
  swapToAppContext();
});

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
    mockCtx.prisma.tag.delete.mockResolvedValue(tag);
    expect(await tagsClient.remove(1, ctx)).toMatchObject({
      id: 1,
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });

  test('Should throw error when tag is not found', async () => {
    mockCtx.prisma.tag.delete.mockRejectedValue(new Error('Mock Error'));
    expect(tagsClient.remove(1, ctx)).rejects.toThrow(NoSuchResource);
  });
});

describe('Tags client get by id', () => {
  test('Should return tag by its id', async () => {
    mockCtx.prisma.tag.findFirstOrThrow.mockResolvedValue(tag);
    await expect(tagsClient.select(1, ctx)).resolves.toMatchObject({
      id: 1,
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });

  test('Should throw error when no tag is found', async () => {
    mockCtx.prisma.tag.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(tagsClient.select(1, ctx)).rejects.toThrow(NoSuchResource);
  });
});

describe('Tags client get all', () => {
  test('Should return existing tags', async () => {
    mockCtx.prisma.tag.findMany.mockResolvedValue([tag]);
    const result = await tagsClient.all(ctx);

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no tags exist', async () => {
    mockCtx.prisma.tag.findMany.mockResolvedValue([]);
    const result = await tagsClient.all(ctx);

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(0);
  });
});

describe('Tags client create', () => {
  test('Should create new user', async () => {
    mockCtx.prisma.tag.create.mockResolvedValue({ ...tag, name: 'Cafeteria' });
    const fields = {
      name: 'Cafeteria',
      description: 'Food is good',
    };
    await expect(tagsClient.create(fields, ctx)).resolves.toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
    });
  });
});
