import { Comment, Like, User } from '@prisma/client';
import request from 'supertest';
import app from '../../src/app';
import {
  MockPrismaContext,
  createMockContext,
  swapToMockContext,
  swapToAppContext,
} from '../../src/db/context';
import auth from '../../src/utils/auth';

let mockCtx: MockPrismaContext;

beforeEach(() => {
  mockCtx = createMockContext();
  swapToMockContext(mockCtx);
});

afterAll(() => {
  swapToAppContext();
});

const timestamp = new Date();

const user: User = {
  id: 1,
  name: 'Test User 1',
  profile_img: '',
  password: 'pw',
  email: 'user@app.com',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const comment: Comment = {
    id: 1,
    idea_id: 1,
    user_id: 1,
    content: 'content',
    updated_at: timestamp,
    created_at: timestamp,
};

const JWT = auth.jwt({ id: user.id });
const mockJWT = () => {
  mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user);
};

/**
 * Tests for POST method on route /comments
 */
describe('POST /comments/', () => {
  test('Route should create and return like with status 200', async () => {
    mockJWT();
    mockCtx.prisma.comment.create.mockResolvedValue(comment);

    const res = await request(app)
      .post('/comments/')
      .auth(JWT, { type: 'bearer' })
      .send(comment)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
        id: 1,
        idea_id: 1,
        user_id: 1,
        content: 'content',
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.comment.create.mockResolvedValue(comment);

    await request(app)
      .post('/comments/')
      .auth('NOT_JWT', { type: 'bearer' })
      .send(comment)
      .expect(401);
  });
});

/**
 * Tests for GET method on route /comments
 */
describe('GET /comments/', () => {
  test('Route should return all comments with status 200', async () => {
    mockJWT();
    mockCtx.prisma.comment.findMany.mockResolvedValue([comment]);

    const res = await request(app)
      .get('/comments/')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject([
        {
            id: 1,
            idea_id: 1,
            user_id: 1,
            content: 'content',
        },
    ]);
  });
});

/**
 * Tests for GET method on route /comments/:id
 */
describe('GET /comments/:id', () => {
  test('Route should 404 with missing comment', async () => {
    mockJWT();
    mockCtx.prisma.comment.findFirstOrThrow.mockRejectedValue(new Error());

    const res = await request(app)
      .get('/comments/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such comment exists',
      status: 404,
    });
  });

  test('Route should return comment with status 200', async () => {
    mockJWT();
    mockCtx.prisma.comment.findFirstOrThrow.mockResolvedValue(comment);

    const res = await request(app)
      .get('/comments/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
            idea_id: 1,
            user_id: 1,
            content: 'content',
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.comment.findFirstOrThrow.mockResolvedValue(comment);

    await request(app).get('/comments/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /comments
 */
describe('DELETE /comments/:id', () => {
  test('Route should 404 with missing like', async () => {
    mockJWT();
    mockCtx.prisma.comment.findFirst.mockResolvedValueOnce(comment);
    mockCtx.prisma.comment.delete.mockRejectedValue(new Error());

    const res = await request(app)
      .delete('/comments/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such comment exists',
      status: 404,
    });
  });

  test('Route should return like with status 200', async () => {
    mockJWT();
    mockCtx.prisma.comment.findFirst.mockResolvedValueOnce(comment);
    mockCtx.prisma.comment.delete.mockResolvedValue(comment);

    const res = await request(app)
      .delete('/comments/1')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
      user_id: 1,
      idea_id: 1,
      content: 'content',
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.comment.delete.mockResolvedValue(comment);

    await request(app).delete('/comments/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
