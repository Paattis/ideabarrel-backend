import { Comment } from '@prisma/client';
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

const resolvedComment = {
  id: 1,
  idea_id: 1,
  user: {
    id: 1,
    name: 'user',
  },
  idea: {
    id: 1,
    user_id: 1,
  },
  user_id: 1,
  content: 'Content',
  updated_at: timestamp,
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

/**
 * Tests for POST method on route /comments
 */
describe('POST /comments/', () => {
  test('Route should create and return like with status 200', async () => {
    mockJWT(true);

    mockDb.comments.create.mockResolvedValue(resolvedComment);

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
      content: 'Content',
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    mockJWT(false);
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
    mockJWT(true);
    mockDb.comments.all.mockResolvedValue([resolvedComment]);

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
        content: 'Content',
      },
    ]);
  });
});

/**
 * Tests for GET method on route /comments/:id
 */
describe('GET /comments/:id', () => {
  test('Route should 404 with missing comment', async () => {
    mockJWT(true);
    mockDb.comments.select.mockRejectedValue(new NoSuchResource('comment'));

    const res = await request(app)
      .get('/comments/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toMatchObject({
      msg: 'No such comment exists',
      status: 404,
    });
  });

  test('Route should return comment with status 200', async () => {
    mockJWT(true);
    mockDb.comments.select.mockResolvedValue(resolvedComment);

    const res = await request(app)
      .get('/comments/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
      idea_id: 1,
      user_id: 1,
      content: 'Content',
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT(false);
    await request(app).get('/comments/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /comments
 */
describe('DELETE /comments/:id', () => {
  test('Route should 404 with missing like', async () => {
    mockJWT(true);
    mockDb.comments.userOwns.mockResolvedValue(true);
    mockDb.comments.remove.mockRejectedValue(new NoSuchResource('comment'));

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

  test('Route should return comment with status 200', async () => {
    mockJWT(true);
    mockDb.comments.userOwns.mockResolvedValueOnce(true);
    mockDb.comments.remove.mockResolvedValue(resolvedComment);

    const res = await request(app)
      .delete('/comments/1')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: 1,
      user_id: 1,
      idea_id: 1,
      content: 'Content',
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockJWT(false);

    await request(app)
      .delete('/comments/1')
      .auth('NOT_JWT', { type: 'bearer' })
      .expect(401);
  });
});
