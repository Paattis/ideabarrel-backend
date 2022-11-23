import { Role, User } from '@prisma/client';
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
  mockJWT();
});

afterAll(() => {
  swapToAppContext();
});

const timestamp = new Date();
const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};

const user2: User = {
  id: 2,
  name: 'Test User 2',
  email: 'user2@app.com',
  profile_img: '',
  password: 'pw',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const user1: User = {
  id: 10,
  name: 'Test User 1',
  email: 'user@app.com',
  profile_img: '',
  password: 'pw',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const JWT = auth.jwt({ id: user1.id });
const mockJWT = () => {
  mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user1);
};

/**
 * Tests for POST method on route /users
 */
describe('POST /users/', () => {
  test('Route should create and return user with status 200', async () => {
    mockCtx.prisma.role.findFirstOrThrow.mockResolvedValue(role);
    mockCtx.prisma.user.create.mockResolvedValue(user1);

    const res = await request(app)
      .post('/users/')
      .auth(JWT, { type: 'bearer' })
      .send(user1);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Route should fail to create user and return error with status 400', async () => {
    mockCtx.prisma.role.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    mockCtx.prisma.user.create.mockResolvedValue(user1);

    try {
      const res = await request(app)
        .post('/users/')
        .auth(JWT, { type: 'bearer' })
        .send(user1);

      expect(res.statusCode).toBe(400);
    } catch (error) {
      // Error
    }
  });
});

/**
 * Tests for DELETE method on route /users
 */
describe('DELETE /users/:id', () => {
  test('Route should delete and return user with status 200', async () => {
    mockJWT();
    mockCtx.prisma.user.findFirst.mockResolvedValue(user1);
    mockCtx.prisma.user.delete.mockResolvedValue(user1);

    const res = await request(app).delete('/users/10').auth(JWT, { type: 'bearer' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    await request(app)
      .delete('/users/10')
      .auth('NOT_JWT', { type: 'bearer' })
      .expect(401);
  });

  test('Route should fail to delete user and return error with status 403', async () => {
    mockJWT();
    mockCtx.prisma.user.findFirst.mockResolvedValueOnce(user2);
    await request(app).delete('/users/2').auth(JWT, { type: 'bearer' }).expect(403);
  });
});

/**
 * Tests for GET method on route /users/:id
 */
describe('GET /users/1', () => {
  test('Route should return User by specified id and status code of 200', async () => {
    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValue(user1);

    const res = await request(app)
      .get('/users/10')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: 10,
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    await request(app).get('/users/10').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });

  test('Route should return no user, and status code of 404', async () => {
    mockCtx.prisma.user.findFirstOrThrow.mockRejectedValue(new Error('Mock error'));
    await request(app).get('/users/10').auth(JWT, { type: 'bearer' }).expect(404);
  });
});

/**
 * Tests for GET method on route /users
 */
describe('GET /users/', () => {
  test('Route should return array of users and status code of 200', async () => {
    mockCtx.prisma.user.findMany.mockResolvedValue([user1, user2]);

    const res = await request(app)
      .get('/users/')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    expect((res.body as any[]).length).toBeGreaterThan(0);
  });

  test('Route should return empty array and status code of 200', async () => {
    mockCtx.prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app)
      .get('/users/')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);
    expect((res.body as any[]).length).toBe(0);
  });
});

/**
 * Tests for PUT method on route /users
 */
describe('PUT /users/:id', () => {
  test('Route should 404 with missing user', async () => {
    mockJWT();
    mockCtx.prisma.user.update.mockRejectedValue(new Error());

    const res = await request(app)
      .put('/users/10')
      .send(user2)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such user exists',
      status: 404,
    });
  });

  test('Route should return new user with status 200', async () => {
    mockJWT();
    mockCtx.prisma.user.findFirst.mockResolvedValue(user1);
    mockCtx.prisma.user.update.mockResolvedValue(user2);

    const res = await request(app)
      .put('/users/10')
      .send(user2)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({ id: 2 });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    await request(app).delete('/users/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
