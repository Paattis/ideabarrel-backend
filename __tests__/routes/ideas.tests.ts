import { User, Tag } from '@prisma/client';
import { IdeaWithTags } from '../../src/db/ideas';
import request from 'supertest';
import app from '../../src/app';
import auth from '../../src/utils/auth';
import {
  MockPrismaContext,
  createMockContext,
  swapToMockContext,
  swapToAppContext,
} from '../../src/db/context';
import { log } from '../../src/logger/log';

jest.setTimeout(15000);

let mockCtx: MockPrismaContext;

afterAll(() => swapToAppContext());

const timestamp = new Date();

const user1: User = {
  id: 1,
  name: 'Test User 1',
  profile_img: '',
  email: 'user@app.com',
  password: 'p455w0rd',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

// JWT for test user
const JWT = auth.jwt({ id: user1.id });
const mockJWT = () => {
  mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1);
};

// top level jest stuff
beforeEach(() => {
  mockCtx = createMockContext();
  swapToMockContext(mockCtx);
  mockJWT();
});

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

const idea: IdeaWithTags = {
  id: 1,
  title: 'title',
  content: 'Lorem ipsum dolor sit amet',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag],
};

const idea2: IdeaWithTags = {
  id: 1,
  title: 'title',
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag2],
};

/**
 * Tests for POST method on route /ideas
 */
describe('POST /ideas/', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    const res = await request(app)
      .post('/ideas/')
      .send({
        content: 'Lorem ipsum dolor sit amet',
        tags: [1],
      });

    expect(res.statusCode).toBe(401);
  }),
    test('Route should create and return idea with status 200', async () => {
      mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1);
      mockCtx.prisma.idea.create.mockResolvedValue(idea);
      mockCtx.prisma.tag.findMany.mockRejectedValue([tag]);

      log.debug(JSON.stringify(idea));

      const res = await request(app)
        .post('/ideas/')
        .auth(JWT, { type: 'bearer' })
        .send({
          content: 'Lorem ipsum dolor sit amet',
          tags: [1],
        });

      expect(res.statusCode).toBe(200);
      log.debug('res body', res.body);
      expect(res.body).toMatchObject({
        id: 1,
        content: 'Lorem ipsum dolor sit amet',
        tags: [expectedTag],
      });
    });

  test('Route should fail to create idea if a non-existent tag is given', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.create.mockRejectedValue(idea);
    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1);
    mockCtx.prisma.tag.create.mockResolvedValue(tag);

    const res = await request(app)
      .post('/ideas/')
      .auth(JWT, { type: 'bearer' })
      .send({
        content: 'This will fail',
        tags: [444],
      });
      log.debug('Res code', res.statusCode);
      log.debug('Res body', res.body);
    expect(res.body).toMatchObject({
      status: 400,
      msg: 'No tag exists with that id, cant create idea.',
    });
    expect(res.statusCode).toBe(400);
  });
});

/**
 * Tests for PUT method on route /ideas/<idea_id>
 */
describe('PUT /ideas/:idea_id', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    const res = await request(app)
      .put('/ideas/1')
      .send({
        content: 'New content',
        tags: [2],
      });

    expect(res.statusCode).toBe(401);
  }),
    test('Route should update and return idea with status 200 and new data', async () => {
      swapToMockContext(mockCtx);
      mockCtx.prisma.idea.update.mockResolvedValue(idea2);
      mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea2);
      mockCtx.prisma.tag.findMany.mockResolvedValue([tag2]);

      const res = await request(app)
        .put('/ideas/1')
        .auth(JWT, { type: 'bearer' })
        .send({
          content: 'New content',
          tags: [2],
        });

      log.debug('res body put test: ', res.body);
      expect(res.body).toMatchObject({
        content: 'New content',
        tags: [
          {
            ...tag2,
            created_at: timestamp.toISOString(),
            updated_at: timestamp.toISOString(),
          },
        ],
      });
    });

  test("Route should fail with status 400 and not update the idea if one or more of the given tags doesn't exist", async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.update.mockResolvedValue(idea);
    mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);
    mockCtx.prisma.tag.update.mockResolvedValue(tag2);

    const res = await request(app)
      .put('/ideas/1')
      .auth(JWT, { type: 'bearer' })
      .send({
        content: 'New content',
        tags: [33, 2],
      });

      log.debug('res body put test 400: ', res.body);
    expect(res.statusCode).toBe(400);
  });
});

/**
 * Tests for DELETE method on route /ideas
 */
describe('DELETE /ideas/:idea_id', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    const res = await request(app).delete('/ideas/1');

    expect(res.statusCode).toBe(401);
  }),
    test('Route should delete and return idea with status 200', async () => {
      swapToMockContext(mockCtx);
      mockCtx.prisma.idea.findFirstOrThrow.mockResolvedValue(idea);
      mockCtx.prisma.idea.delete.mockResolvedValue(idea);

      const res = await request(app).delete('/ideas/1').auth(JWT, { type: 'bearer' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        id: 1,
        content: 'Lorem ipsum dolor sit amet',
      });
    });

  test('Route should fail to delete non-existent idea and return error with status 404', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.idea.delete.mockRejectedValue(idea);
    const res = await request(app).delete('/ideas/11').auth(JWT, { type: 'bearer' });
    log.debug('res body', res.body);
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      status: 404,
      msg: 'No such idea exists',
    });
  });
});
