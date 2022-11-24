import { Tag, User } from '@prisma/client';
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
const tag: Tag = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Cafeteria',
  description: 'Food is good',
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
 * Tests for POST method on route /tags
 */
describe('POST /tags/', () => {
  test('Route should create and return tag with status 200', async () => {
    mockJWT();
    mockCtx.prisma.tag.create.mockResolvedValue(tag);

    const res = await request(app)
      .post('/tags/')
      .auth(JWT, { type: 'bearer' })
      .send(tag)
      // .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
      id: 1,
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.tag.create.mockResolvedValue(tag);

    await request(app)
      .post('/tags/')
      .auth('NOT_JWT', { type: 'bearer' })
      .send(tag)
      .expect(401);
  });
});

/**
 * Tests for GET method on route /tags
 */
describe('GET /tags/', () => {
  test('Route should return all tags with status 200', async () => {
    mockCtx.prisma.tag.findMany.mockResolvedValue([tag]);

    const res = await request(app)
      .get('/tags/')
      .send(tag)
      // .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject([
      {
        name: 'Cafeteria',
        description: 'Food is good',
        id: 1,
      },
    ]);
  });
});

/**
 * Tests for GET method on route /tags/:id
 */
describe('GET /tags/:id', () => {
  test('Route should 404 with missing tag', async () => {
    mockJWT();
    mockCtx.prisma.tag.findFirstOrThrow.mockRejectedValue(new Error());

    const res = await request(app)
      .get('/tags/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such tag exists',
      status: 404,
    });
  });

  test('Route should return tag with status 200', async () => {
    mockJWT();
    mockCtx.prisma.tag.findFirstOrThrow.mockResolvedValue(tag);

    const res = await request(app)
      .get('/tags/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.tag.findFirstOrThrow.mockResolvedValue(tag);

    await request(app).get('/tags/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /tags
 */
describe('DELETE /tags/:id', () => {
  test('Route should 404 with missing tag', async () => {
    mockJWT();
    mockCtx.prisma.tag.delete.mockRejectedValue(new Error());

    const res = await request(app)
      .delete('/tags/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such tag exists',
      status: 404,
    });
  });

  test('Route should return tag with status 200', async () => {
    mockJWT();
    mockCtx.prisma.tag.delete.mockResolvedValue(tag);

    const res = await request(app)
      .delete('/tags/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.tag.delete.mockResolvedValue(tag);

    await request(app).delete('/tags/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /tags
 */
describe('PUT /tags/:id', () => {
  test('Route should 404 with missing tag', async () => {
    mockJWT();
    const newTag = { name: 'Test Engineer 2' };
    mockCtx.prisma.tag.update.mockRejectedValue(new Error());

    const res = await request(app)
      .put('/tags/1')
      .send(newTag)
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such tag exists',
      status: 404,
    });
  });

  test('Route should return tag with status 200', async () => {
    mockJWT();
    const updateResult: Tag = {
      id: 1,
      created_at: timestamp,
      updated_at: timestamp,
      name: 'Restaurant',
      description: 'Food is great',
    };
    const newTag = { name: 'Restaurant' };
    mockCtx.prisma.tag.update.mockResolvedValue(updateResult);

    const res = await request(app)
      .put('/tags/1')
      .send(newTag)
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      name: 'Restaurant',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT();
    mockCtx.prisma.tag.update.mockResolvedValue(tag);

    await request(app).delete('/tags/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
