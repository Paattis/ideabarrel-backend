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

const JWT = auth.jwt({ id: user.id });
const mockJWT = () => {
  mockCtx.prisma.user.findFirstOrThrow.mockResolvedValueOnce(user);
};

/**
 * Tests for POST method on route /roles
 */
describe('POST /roles/', () => {
  test('Route should create and return user with status 200', async () => {
    mockJWT();
    mockCtx.prisma.role.create.mockResolvedValue(role);

    const res = await request(app)
      .post('/roles/')
      .auth(JWT, { type: 'bearer' })
      .send(role)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Test Engineer',
      id: 1,
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.role.create.mockResolvedValue(role);

    await request(app)
      .post('/roles/')
      .auth('NOT_JWT', { type: 'bearer' })
      .send(role)
      .expect(401);
  });
});

/**
 * Tests for GET method on route /roles
 */
describe('GET /roles/', () => {
  test('Route should return all roles with status 200', async () => {
    mockCtx.prisma.role.findMany.mockResolvedValue([role]);

    const res = await request(app)
      .get('/roles/')
      .send(role)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject([
      {
        name: 'Test Engineer',
        id: 1,
      },
    ]);
  });
});

/**
 * Tests for GET method on route /roles/:id
 */
describe('GET /roles/:id', () => {
  test('Route should 404 with missing role', async () => {
    mockJWT();
    mockCtx.prisma.role.findFirstOrThrow.mockRejectedValue(new Error());

    const res = await request(app)
      .get('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such role exists',
      status: 404,
    });
  });

  test('Route should return role with status 200', async () => {
    mockJWT();
    mockCtx.prisma.role.findFirstOrThrow.mockResolvedValue(role);

    const res = await request(app)
      .get('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Test Engineer',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.role.findFirstOrThrow.mockResolvedValue(role);

    await request(app).get('/roles/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /roles
 */
describe('DELETE /roles/:id', () => {
  test('Route should 404 with missing role', async () => {
    mockJWT();
    mockCtx.prisma.role.delete.mockRejectedValue(new Error());

    const res = await request(app)
      .delete('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such role exists',
      status: 404,
    });
  });

  test('Route should return role with status 200', async () => {
    mockJWT();
    mockCtx.prisma.role.delete.mockResolvedValue(role);

    const res = await request(app)
      .delete('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Test Engineer',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.role.delete.mockResolvedValue(role);

    await request(app).delete('/roles/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /roles
 */
describe('PUT /roles/:id', () => {
  test('Route should 404 with missing role', async () => {
    mockJWT();
    const newRole = { name: 'Test Engineer 2' };
    mockCtx.prisma.role.update.mockRejectedValue(new Error());

    const res = await request(app)
      .put('/roles/1')
      .send(newRole)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such role exists',
      status: 404,
    });
  });

  test('Route should return role with status 200', async () => {
    mockJWT();
    const updateResult: Role = {
      id: 1,
      created_at: timestamp,
      updated_at: timestamp,
      name: 'Test Engineer 2',
    };
    const newRole = { name: 'Test Engineer 2' };
    mockCtx.prisma.role.update.mockResolvedValue(updateResult);

    const res = await request(app)
      .put('/roles/1')
      .send(newRole)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Test Engineer 2',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.role.update.mockResolvedValue(role);

    await request(app).delete('/roles/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
