import { Like } from '@prisma/client';
import likesClient, { LikeFields } from '../../src/db/likes';
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

afterAll(() => swapToAppContext());

const timestamp = new Date();
const like: Like = {
  created_at: timestamp,
  id: 1,
  idea_id: 1,
  user_id: 1
}

describe('Likes client remove', () => {
  test('Should remove existing like', async () => {
    mockCtx.prisma.like.delete.mockResolvedValue(like);
    expect(await likesClient.remove(1, ctx)).toMatchObject({
        id: 1,
        idea_id: 1,
        user_id: 1
      });
  });

  test('Should throw error when like is not found', async () => {
    mockCtx.prisma.like.delete.mockRejectedValue(new Error('Mock Error'));
    expect(likesClient.remove(1, ctx)).rejects.toThrow(NoSuchResource);
  });
});

describe('Likes client get by id', () => {
  test('Should return like by its id', async () => {
    mockCtx.prisma.like.findFirstOrThrow.mockResolvedValue(like);
    await expect(likesClient.select(1, ctx)).resolves.toMatchObject({
        id: 1,
        idea_id: 1,
        user_id: 1
    });
  });

  test('Should throw error when no like is found', async () => {
    mockCtx.prisma.like.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(likesClient.select(1, ctx)).rejects.toThrow(NoSuchResource);
  });
});

describe('Likes client get all', () => {
  test('Should return existing likes', async () => {
    mockCtx.prisma.like.findMany.mockResolvedValue([like]);
    const result = await likesClient.all(ctx);

    expect(result).toBeInstanceOf(Array<Like>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no likes exist', async () => {
    mockCtx.prisma.like.findMany.mockResolvedValue([]);
    const result = await likesClient.all(ctx);

    expect(result).toBeInstanceOf(Array<Like>);
    expect(result.length).toBe(0);
  });
});

describe('Likes client create', () => {
  test('Should create new like', async () => {
    mockCtx.prisma.like.create.mockResolvedValue({ ...like });
    const fields: LikeFields = {
      idea_id: 1,
      user_id: 1
    };

    await expect(likesClient.create(fields, ctx)).resolves.toMatchObject({
      idea_id: 1,
      user_id: 1
    });
  });
});
