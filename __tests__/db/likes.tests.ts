import { Like, PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DbType, dbMock, Likes } from '../../src/db/Database';
import { BadRequest, NoSuchResource } from '../../src/utils/errors';

const prismaMock = mockDeep<PrismaClient>();
const db = dbMock(DbType.MOCK_PRISMA, prismaMock);
afterEach(() => mockReset(prismaMock));

const timestamp = new Date();
const like: Like = {
  created_at: timestamp,
  id: 1,
  idea_id: 1,
  user_id: 1,
};

const user = {
  id: 2,
  name: 'Test User 1',
  profile_img: '',
  email: 'user@app.com',
  role_id: 1,
};

describe('Likes client remove', () => {
  test('Should remove existing like', async () => {
    prismaMock.like.delete.mockResolvedValue(like);
    expect(await db.likes.remove(1)).toMatchObject({
      id: 1,
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should remove existing like from idea', async () => {
    prismaMock.like.delete.mockResolvedValue(like);
    expect(await db.likes.removeFromIdea(like.id, user.id)).toMatchObject({
      id: 1,
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should throw error when like is not found', async () => {
    prismaMock.like.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.likes.remove(1)).rejects.toThrow(NoSuchResource);
  });

  test('Should throw error when like is not found', async () => {
    prismaMock.like.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.likes.removeFromIdea(1, 2)).rejects.toThrow(BadRequest);
  });
});

describe('Likes client get by id', () => {
  test('Should return like by its id', async () => {
    prismaMock.like.findFirstOrThrow.mockResolvedValue(like);
    await expect(db.likes.select(1)).resolves.toMatchObject({
      id: 1,
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Should throw error when no like is found', async () => {
    prismaMock.like.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(db.likes.select(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Likes client get all', () => {
  test('Should return existing likes', async () => {
    prismaMock.like.findMany.mockResolvedValue([like]);
    const result = await db.likes.all();

    expect(result).toBeInstanceOf(Array<Like>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no likes exist', async () => {
    prismaMock.like.findMany.mockResolvedValue([]);
    const result = await db.likes.all();

    expect(result).toBeInstanceOf(Array<Like>);
    expect(result.length).toBe(0);
  });
});

describe('Likes client create', () => {
  test('Should create new like', async () => {
    prismaMock.like.create.mockResolvedValue({ ...like });
    const fields: Likes.Create = {
      idea_id: 1,
      user_id: 1,
    };

    await expect(db.likes.create(fields)).resolves.toMatchObject({
      idea_id: 1,
      user_id: 1,
    });
  });
});
