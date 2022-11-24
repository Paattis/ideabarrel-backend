import { Comment, User } from '@prisma/client';
import commentsClient, { CommentFields } from '../../src/db/comments';
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
const comment: Comment = {
  created_at: timestamp,
  updated_at: timestamp,
  id: 1,
  content: 'content',
  idea_id: 1,
  user_id: 1,
};

describe('Comments client remove', () => {
  test('Should remove existing comment', async () => {
    mockCtx.prisma.comment.delete.mockResolvedValue(comment);
    expect(await commentsClient.remove(1, ctx)).toMatchObject({
      id: 1,
      content: 'content',
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should throw error when comment is not found', async () => {
    mockCtx.prisma.comment.delete.mockRejectedValue(new Error('Mock Error'));
    expect(commentsClient.remove(1, ctx)).rejects.toThrow(NoSuchResource);
  });
});

describe('Comments client get by id', () => {
  test('Should return comment by its id', async () => {
    mockCtx.prisma.comment.findFirstOrThrow.mockResolvedValue(comment);
    await expect(commentsClient.select(1, ctx)).resolves.toMatchObject({
      id: 1,
      content: 'content',
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should throw error when no comment is found', async () => {
    mockCtx.prisma.comment.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(commentsClient.select(1, ctx)).rejects.toThrow(NoSuchResource);
  });
});

describe('Comments client get all', () => {
  test('Should return existing comments', async () => {
    mockCtx.prisma.comment.findMany.mockResolvedValue([comment]);
    const result = await commentsClient.all(ctx);

    expect(result).toBeInstanceOf(Array<Comment>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no comments exist', async () => {
    mockCtx.prisma.comment.findMany.mockResolvedValue([]);
    const result = await commentsClient.all(ctx);

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(0);
  });
});

describe('Comments client create', () => {
  test('Should create new comment', async () => {
    mockCtx.prisma.comment.create.mockResolvedValue({ ...comment });
    const fields: CommentFields = {
      content: 'content',
      idea_id: 1,
      user_id: 1,
    };

    await expect(commentsClient.create(fields, ctx)).resolves.toMatchObject({
      content: 'content',
      idea_id: 1,
      user_id: 1,
    });
  });
});
