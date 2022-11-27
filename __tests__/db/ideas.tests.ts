import { User, Idea, Tag, PrismaClient } from '@prisma/client';
import { BadRequest, NoSuchResource } from '../../src/utils/errors';
import { log } from '../../src/logger/log';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DbType, getClient } from '../../src/db/Database';

const prismaMock = mockDeep<PrismaClient>();
const db = getClient(DbType.MOCK_PRISMA, prismaMock);
afterEach(() => mockReset(prismaMock));

const timestamp = new Date();
const tag: Tag = {
  id: 1,
  description: 'Test tag',
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test tag',
};

const tag2: Tag = {
  id: 2,
  description: 'Test tag2',
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test tag2',
};

const user1: User = {
  profile_img: '',
  id: 1,
  name: 'Test User 1',
  password: 'pw',
  email: 'user@app.com',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const idea = {
  id: 1,
  title: 'title',
  content: 'Lorem ipsum dolor sit amet',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag],
};

const updatedIdea = {
  id: 1,
  title: 'title',
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag2],
};

const idea2 = {
  id: 2,
  title: 'title',
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag2],
};

describe('Ideas database access client', () => {
  test('Should return idea by its id', async () => {
    prismaMock.idea.findFirstOrThrow.mockResolvedValue(idea);
    await expect(db.ideas.select(1, user1)).resolves.toMatchObject({ id: 1 });
  });

  test('Should create idea', async () => {
    prismaMock.idea.create.mockResolvedValue(idea);
    prismaMock.tag.findMany.mockResolvedValue([tag]);
    const res = db.ideas.create(
      {
        title: 'title',
        content: 'Lorem ipsum dolor sit amet',
        tags: [1],
      },
      user1
    );

    await expect(res).resolves.toMatchObject(idea);
  });

  test('Should throw error when no idea is found', async () => {
    prismaMock.idea.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(db.ideas.select(1, user1)).rejects.toThrow(NoSuchResource);
  });

  test('Should remove existing idea', async () => {
    prismaMock.idea.findFirstOrThrow.mockResolvedValue(idea);
    prismaMock.idea.delete.mockResolvedValue(idea);
    const res = await db.ideas.remove(1, user1);

    expect(res).not.toBeNull();
    expect(res).toMatchObject({ id: 1 });
  });

  test('Should throw error', async () => {
    prismaMock.idea.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.ideas.remove(666, user1)).rejects.toThrow(NoSuchResource);
  });

  test('Should return existing ideas', async () => {
    prismaMock.idea.findMany.mockResolvedValue([idea, idea2]);
    const result = await db.ideas.all(0, []);

    expect(result).toBeInstanceOf(Array<Idea>);
    expect(result.length).toBe(2);
    log.info(`result ${JSON.stringify(result.map((x) => x.id))}`);
    expect(result.find((it) => it.id === 1)).toMatchObject({
      id: 1,
    });
    expect(result.find((it) => it.id === 2)).toMatchObject({
      id: 2,
    });
  });

  test('Should update existing idea', async () => {
    prismaMock.idea.update.mockResolvedValue(updatedIdea);
    prismaMock.idea.findFirstOrThrow.mockResolvedValue(updatedIdea);
    prismaMock.tag.findMany.mockResolvedValue([tag2]);
    const res = await db.ideas.update(
      {
        title: 'title',
        content: 'New content',
        tags: [2],
      },
      1
    );

    expect(res).not.toBeNull();
    expect(res).toMatchObject({
      content: 'New content',
      tags: [
        {
          ...tag2,
          created_at: timestamp,
          updated_at: timestamp,
        },
      ],
    });
  });

  test('Should fail to update existing idea if the given tag doesnt exist', async () => {
    prismaMock.idea.update.mockResolvedValue(idea);
    prismaMock.idea.findFirstOrThrow.mockResolvedValue(idea);

    const res = db.ideas.update(
      {
        title: 'title',
        content: 'New content',
        tags: [123],
      },
      1
    );

    await expect(res).rejects.toThrow(BadRequest);
  });
});
