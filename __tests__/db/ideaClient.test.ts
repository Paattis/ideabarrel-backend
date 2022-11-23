import { Role, User, Idea, Tag } from '@prisma/client';
import ideasClient, { IdeaWithTags } from '../../src/db/ideas';
import {
  MockPrismaContext,
  PrismaContext,
  createMockContext,
  swapToAppContext,
} from '../../src/db/context';
import { BadRequest, NoSuchResource } from '../../src/utils/errors';

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

// required because the endpoint returns tags with dates as strings
const expectedTag = {
  ...tag,
  created_at: timestamp.toISOString(),
  updated_at: timestamp.toISOString(),
};

const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
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
const user2: User = {
  profile_img: '',
  id: 2,
  name: 'Test User 2',
  email: 'user2@app.com',
  password: 'pw',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const idea: IdeaWithTags = {
  id: 1,
  content: 'Lorem ipsum dolor sit amet',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag],
};

const updatedIdea: IdeaWithTags = {
  id: 1,
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag2],
};

const idea2: IdeaWithTags = {
  id: 2,
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag2],
};

describe('Ideas database access client', () => {
  test('Should return idea by its id', async () => {
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);
    await expect(ideasClient.select(1, user1, ctx)).resolves.toMatchObject({ id: 1 });
  });

  test('Should create idea', async () => {
    mockCtx.prisma.idea.create.mockResolvedValue(idea);
    mockCtx.prisma.tag.findMany.mockResolvedValue([tag]);
    const res = ideasClient.create(
      {
        content: 'Lorem ipsum dolor sit amet',
        tags: [1],
      },
      user1,
      ctx
    );

    await expect(res).resolves.toMatchObject(idea);
  });

  test('Should throw error when no idea is found', async () => {
    mockCtx.prisma.idea.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(ideasClient.select(1, user1, ctx)).rejects.toThrow(NoSuchResource);
  });

  test('Should remove existing idea', async () => {
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);
    mockCtx.prisma.idea.delete.mockResolvedValue(idea);
    const res = await ideasClient.remove(1, user1, ctx);

    expect(res).not.toBeNull();
    expect(res).toMatchObject({ id: 1 });
  });

  test('Should throw error', async () => {
    mockCtx.prisma.idea.delete.mockRejectedValue(new Error('Mock Error'));
    expect(ideasClient.remove(666, user1, ctx)).rejects.toThrow(NoSuchResource);
  });

  test('Should return existing ideas', async () => {
    mockCtx.prisma.idea.findMany.mockResolvedValue([idea, idea2]);
    const result = await ideasClient.all(ctx, 0, user1, []);

    expect(result).toBeInstanceOf(Array<Idea>);
    expect(result.length).toBe(2);
    console.log(`result ${JSON.stringify(result.map((x) => x.id))}`);
    expect(result.find((it) => it.id === 1)).toMatchObject({
      id: 1,
    });
    expect(result.find((it) => it.id === 2)).toMatchObject({
      id: 2,
    });
  });

  test('Should update existing idea', async () => {
    mockCtx.prisma.idea.update.mockResolvedValue(updatedIdea);
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(updatedIdea);
    mockCtx.prisma.tag.findMany.mockResolvedValue([tag2]);
    const res = await ideasClient.update(
      {
        content: 'New content',
        tags: [2],
      },
      1,
      user1,
      ctx
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
    mockCtx.prisma.idea.update.mockResolvedValue(idea);
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);

    const res = ideasClient.update(
      {
        content: 'New content',
        tags: [123],
      },
      1,
      user1,
      ctx
    );

    await expect(res).rejects.toThrow(BadRequest);
  });
});
