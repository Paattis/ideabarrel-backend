import { Comment, PrismaClient, User } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { Comments, DbType, dbMock } from '../../src/db/Database';
import { NoSuchResource } from '../../src/utils/errors';

const prismaMock = mockDeep<PrismaClient>();
const db = dbMock(DbType.MOCK_PRISMA, prismaMock);
afterEach(() => mockReset(prismaMock));

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
    prismaMock.comment.delete.mockResolvedValue(comment);
    expect(await db.comments.remove(1)).toMatchObject({
      id: 1,
      content: 'content',
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should throw error when comment is not found', async () => {
    prismaMock.comment.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.comments.remove(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Comments client get by id', () => {
  test('Should return comment by its id', async () => {
    prismaMock.comment.findFirstOrThrow.mockResolvedValue(comment);
    await expect(db.comments.select(1)).resolves.toMatchObject({
      id: 1,
      content: 'content',
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should throw error when no comment is found', async () => {
    prismaMock.comment.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(db.comments.select(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Comments client get all', () => {
  test('Should return existing comments', async () => {
    prismaMock.comment.findMany.mockResolvedValue([comment]);
    const result = await db.comments.all();

    expect(result).toBeInstanceOf(Array<Comment>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no comments exist', async () => {
    prismaMock.comment.findMany.mockResolvedValue([]);
    const result = await db.comments.all();

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(0);
  });
});

describe('Comments client create', () => {
  test('Should create new comment', async () => {
    prismaMock.comment.create.mockResolvedValue({ ...comment });
    const fields: Comments.Create = {
      content: 'content',
      idea_id: 1,
      user_id: 1,
    };

    await expect(db.comments.create(fields)).resolves.toMatchObject({
      content: 'content',
      idea_id: 1,
      user_id: 1,
    });
  });
});
