import { Like } from '@prisma/client';
import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import request from 'supertest';
import app from '../../src/app';
import { Database, DbType, getClient } from '../../src/db/Database';
import auth from '../../src/utils/auth';
import { NoSuchResource } from '../../src/utils/errors';

const mockDb: DeepMockProxy<Database> = getClient(
  DbType.MOCK_CLIENT
) as DeepMockProxy<Database>;
afterEach(() => mockReset(mockDb));

const timestamp = new Date();

const user = {
  id: 2,
  name: 'Test User 1',
  profile_img: '',
  email: 'user@app.com',
  role_id: 1,
};

const admin = {
  id: 1,
  name: 'Test User 1',
  profile_img: '',
  email: 'user@app.com',
  role_id: 2,
};

const like: Like = {
  id: 1,
  idea_id: 1,
  user_id: 1,
  created_at: timestamp,
};

const JWT = auth.jwt({ id: user.id });
const mockJWT = (success: boolean) => {
  if (success) {
    mockDb.users.select.mockResolvedValueOnce(user as any);
  } else {
    mockDb.users.select.mockRejectedValueOnce(new Error('No suck user'));
  }
};

const ADMIN_JWT = auth.jwt({ id: admin.id });
const mockAdminJWT = (success: boolean) => {
  if (success) {
    mockDb.users.select.mockResolvedValueOnce(admin as any);
  } else {
    mockDb.users.select.mockRejectedValueOnce(new Error('No suck user'));
  }
};

/**
 * Tests for POST method on route /likes
 */
describe('POST /likes/', () => {
  test('Route should create and return like with status 200', async () => {
    // Mock Authentication
    mockJWT(true);
    // Mock resulting action.
    mockDb.likes.create.mockResolvedValue(like as any);

    // Action
    const res = await request(app)
      .post('/likes/')
      .auth(JWT, { type: 'bearer' })
      .send(like)
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      id: 1,
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    // Mock Authentication
    mockJWT(false);

    // Action
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
    // Mock Authentication
    mockJWT(true);
    // Mock resulting action.
    mockDb.likes.all.mockResolvedValue([like]);

    // Action
    const res = await request(app)
      .get('/likes/')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
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
    // Mock Authentication
    mockJWT(true);

    // Mock resulting action.
    mockDb.likes.select.mockRejectedValue(new NoSuchResource('like'));

    // Action
    const res = await request(app)
      .get('/likes/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such like exists',
      status: 404,
    });
  });

  test('Route should return like with status 200', async () => {
    // Mock Authentication
    mockJWT(true);
    // Mock resulting action.
    mockDb.likes.select.mockResolvedValue(like as any);

    // Action
    const res = await request(app)
      .get('/likes/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      id: 1,
      idea_id: 1,
      user_id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock Authentication
    mockJWT(false);

    // Action
    await request(app).get('/likes/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /likes
 */
describe('DELETE /likes/:id', () => {
  test('Route should 404 with missing like', async () => {
    // Mock Authentication
    mockAdminJWT(true);
    // Mock resulting action.
    mockDb.likes.remove.mockRejectedValue(new NoSuchResource('like'));

    // Action
    const res = await request(app)
      .delete('/likes/10000')
      .auth(ADMIN_JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such like exists',
      status: 404,
    });
  });

  test('Route should return like with status 200', async () => {
    // Mock Authentication
    mockJWT(true);
    mockDb.likes.userOwns.mockResolvedValue(true);
    mockDb.likes.remove.mockResolvedValue(like as any);

    // Action
    const res = await request(app)
      .delete('/likes/1')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      id: 1,
      user_id: 1,
      idea_id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock Authentication
    mockJWT(false);

    // Action
    await request(app).delete('/likes/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
