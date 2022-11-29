import { Tag } from '@prisma/client';
import request from 'supertest';
import app from '../../src/app';
import auth from '../../src/utils/auth';
import { log } from '../../src/logger/log';
import { Database, DbType, dbMock } from '../../src/db/Database';
import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import { BadRequest, NoSuchResource } from '../../src/utils/errors';

const mockDb: DeepMockProxy<Database> = dbMock(
  DbType.MOCK_CLIENT
) as DeepMockProxy<Database>;
afterEach(() => mockReset(mockDb));

const timestamp = new Date();

const user = {
  id: 2,
  name: 'Test User 1',
  profile_img: '',
  email: 'user@app.com',
  password: 'p455w0rd',
  role_id: 1,
};

const admin = {
  id: 1,
  name: 'Test User 1',
  profile_img: '',
  email: 'user@app.com',
  password: 'p455w0rd',
  role_id: 1,
};

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

const idea = {
  id: 1,
  title: 'title',
  content: 'Lorem ipsum dolor sit amet',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag],
};

const idea2 = {
  id: 1,
  title: 'title',
  content: 'New content',
  user_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  tags: [tag2],
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
 * Tests for POST method on route /ideas
 */
describe('POST /ideas/', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    // Mock authentication
    mockJWT(false);

    // Actions
    const res = await request(app)
      .post('/ideas/')
      .send({
        title: 'title',
        content: 'Lorem ipsum dolor sit amet',
        tags: [1],
      });

    // Results
    expect(res.statusCode).toBe(401);
  });

  test('Route should create and return idea with status 200', async () => {
    // Mock authentication
    mockJWT(true);
    // Mock resulting actions.
    mockDb.ideas.create.mockResolvedValue(idea as any);

    // Actions
    const res = await request(app)
      .post('/ideas/')
      .auth(JWT, { type: 'bearer' })
      .send({
        title: 'title',
        content: 'Lorem ipsum dolor sit amet',
        tags: [1],
      });

    // Results
    expect(res.statusCode).toBe(200);
    log.debug('res body', res.body);
    expect(res.body).toMatchObject({
      id: 1,
      content: 'Lorem ipsum dolor sit amet',
      tags: [expectedTag],
    });
  });

  test('Route should fail to create idea if a non-existent tag is given', async () => {
    // Mock authentication
    mockJWT(true);
    // Mock resulting actions.
    mockDb.ideas.create.mockRejectedValue(
      new BadRequest('No tag exists with that id, cant create idea.')
    );

    // Actions
    const res = await request(app)
      .post('/ideas/')
      .auth(JWT, { type: 'bearer' })
      .send({
        title: 'title',
        content: 'This will fail',
        tags: [444],
      });

    // results
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
    // Mock authentication
    mockJWT(false);

    // Actions
    const res = await request(app)
      .put('/ideas/1')
      .send({
        content: 'New content',
        tags: [2],
      });
    // results
    expect(res.statusCode).toBe(401);
  });

  test('Route should update and return idea with status 200 and new data', async () => {
    // Mock authentication
    mockJWT(true);
    mockDb.ideas.userOwns.mockResolvedValue(true);
    // Mock Resulting actions
    mockDb.ideas.update.mockResolvedValue(idea2 as any);

    // Actions
    const res = await request(app)
      .put('/ideas/1')
      .auth(JWT, { type: 'bearer' })
      .send({
        title: 'title',
        content: 'New content',
        tags: [2],
      })
      .expect(200);

    // Results
    log.debug('res body put test: ', res.body);
    expect(res.body).toMatchObject({
      title: 'title',
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
    // Mock authentication
    mockJWT(true);
    mockDb.ideas.userOwns.mockResolvedValue(true);
    // Mock Resulting actions
    mockDb.ideas.update.mockResolvedValue(tag2 as any);

    // Actions
    const res = await request(app)
      .put('/ideas/1')
      .auth(JWT, { type: 'bearer' })
      .send({
        content: 'New content',
        tags: [33, 2],
      });

    // Results
    log.debug('res body put test 400: ', res.body);
    expect(res.statusCode).toBe(400);
  });
});

/**
 * Tests for DELETE method on route /ideas
 */
describe('DELETE /ideas/:idea_id', () => {
  test('Route should give out a 401 if no user is logged in', async () => {
    // Mock authentication
    mockJWT(false);
    // Actions
    const res = await request(app).delete('/ideas/1');

    // Results
    expect(res.statusCode).toBe(401);
  });

  test('Route should delete and return idea with status 200', async () => {
    // Mock authentication
    mockJWT(true);
    mockDb.ideas.userOwns.mockResolvedValue(true);
    // Mock resulting actions
    mockDb.ideas.remove.mockResolvedValue(idea as any);

    // Actions
    const res = await request(app).delete('/ideas/1').auth(JWT, { type: 'bearer' });

    // Results
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      content: 'Lorem ipsum dolor sit amet',
    });
  });

  test('Route should fail to delete non-existent idea and return error with status 404', async () => {
    // Mock ADMIN authentication
    mockAdminJWT(true);
    // Mock resulting actions
    mockDb.ideas.remove.mockRejectedValue(new NoSuchResource('idea'));

    // Actions
    const res = await request(app)
      .delete('/ideas/11')
      .auth(ADMIN_JWT, { type: 'bearer' });

    // Results
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      status: 404,
      msg: 'No such idea exists',
    });
  });
});
