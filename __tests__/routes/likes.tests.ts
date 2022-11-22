import { Like, User } from '@prisma/client';
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

const like: Like = {
    id: 1,
    idea_id: 1,
    user_id: 1,
    created_at: timestamp,
  };

  const like2: Like = {
    id: 2,
    idea_id: 2,
    user_id: 1,
    created_at: timestamp,
  };

const JWT = auth.jwt({ id: user.id });
const mockJWT = () => {
  mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user);
};

/**
 * Tests for POST method on route /likes
 */
describe('POST /likes/', () => {
  test('Route should create and return like with status 200', async () => {
    mockJWT();
    mockCtx.prisma.like.create.mockResolvedValue(like);

    const res = await request(app)
      .post('/likes/')
      .auth(JWT, { type: 'bearer' })
      .send(like)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
        id: 1,
        idea_id: 1,
        user_id: 1,
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.like.create.mockResolvedValue(like);

    await request(app)
      .post('/likes/')
      .auth('NOT_JWT', { type: 'bearer' })
      .send(like)
      .expect(401);
  });
});

/**
 * Tests for GET method on route /likes
 */
describe('GET /likes/', () => {
  test('Route should return all likes with status 200', async () => {
    mockJWT();
    mockCtx.prisma.like.findMany.mockResolvedValue([like]);

    const res = await request(app)
      .get('/likes/')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject([
        {
            id: 1,
            idea_id: 1,
            user_id: 1,
        },
    ]);
  });
});

/**
 * Tests for GET method on route /likes/:id
 */
describe('GET /likes/:id', () => {
  test('Route should 404 with missing like', async () => {
    mockJWT();
    mockCtx.prisma.like.findFirstOrThrow.mockRejectedValue(new Error());

    const res = await request(app)
      .get('/likes/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such like exists',
      status: 404,
    });
  });

  test('Route should return like with status 200', async () => {
    mockJWT();
    mockCtx.prisma.like.findFirstOrThrow.mockResolvedValue(like);

    const res = await request(app)
      .get('/likes/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
            idea_id: 1,
            user_id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.like.findFirstOrThrow.mockResolvedValue(like);

    await request(app).get('/likes/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /likes
 */
describe('DELETE /likes/:id', () => {
  test('Route should 404 with missing like', async () => {
    mockJWT();
    mockCtx.prisma.like.findFirst.mockResolvedValueOnce(like);
    mockCtx.prisma.like.delete.mockRejectedValue(new Error());

    const res = await request(app)
      .delete('/likes/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such like exists',
      status: 404,
    });
  });

  test('Route should return like with status 200', async () => {
    mockJWT();
    mockCtx.prisma.like.findFirst.mockResolvedValueOnce(like);
    mockCtx.prisma.like.delete.mockResolvedValue(like);

    const res = await request(app)
      .delete('/likes/1')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
      user_id: 1,
      idea_id: 1
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.like.delete.mockResolvedValue(like);

    await request(app).delete('/likes/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
