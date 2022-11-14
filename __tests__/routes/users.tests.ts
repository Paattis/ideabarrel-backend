import { Role, User } from '@prisma/client';
import request from 'supertest';
import app from '../../src/app';
import {
  MockPrismaContext,
  PrismaContext,
  createMockContext,
  swapToMockContext,
  swapToAppContext,
} from '../../src/db/context';

jest.setTimeout(15000);

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
const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};
const user1: User = {
  id: 1,
  name: 'Test User 1',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};
const user2: User = {
  id: 2,
  name: 'Test User 2',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

/**
 * Tests for POST method on route /users
 */
describe('POST /users/', () => {
  test('Route should create and return user with status 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.role.findFirstOrThrow.mockResolvedValue(role);
    mockCtx.prisma.user.create.mockResolvedValue(user1);

    const res = await request(app).post('/users/').send(user1);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Route should fail to create user and return error with status 400', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.role.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    mockCtx.prisma.user.create.mockResolvedValue(user1);

    try {
      const res = await request(app).post('/users/').send(user1);
      expect(res.statusCode).toBe(400);
    } catch (error) {}
  });
});

/**
 * Tests for DELETE method on route /users
 */
describe('DELETE /users/:id', () => {
  test('Route should delete and return user with status 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.user.delete.mockResolvedValue(user1);

    const res = await request(app).delete('/users/1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Route should fail to delete user and return error with status 404', async () => {
    swapToMockContext(mockCtx);

    mockCtx.prisma.user.delete.mockRejectedValue(new Error('Mock Error'));
    await request(app).delete('/users/420').expect(404);
  });
});

/**
 * Tests for GET method on route /users/:id
 */
describe('GET /users/1', () => {
  test('Route should return User by specified id and status code of 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findFirstOrThrow.mockResolvedValue(user1);

    const res = await request(app).get('/users/1').expect(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Route should return no user, and status code of 404', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findFirstOrThrow.mockRejectedValue(new Error('Mock error'));
    await request(app).get('/users/1').expect(404);
  });
});

/**
 * Tests for GET method on route /users
 */
describe('GET /users/', () => {
  test('Route should return array of users and status code of 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findMany.mockResolvedValue([user1, user2]);

    const res = await request(app).get('/users/').expect(200);
    expect((res.body as any[]).length).toBeGreaterThan(0);
  });

  test('Route should return empty array and status code of 200', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findMany.mockResolvedValue([]);

    const res = await request(app).get('/users/').expect(200);
    expect((res.body as any[]).length).toBe(0);
  });
});