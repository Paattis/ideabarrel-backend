import { Tag, User } from '@prisma/client';
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
const tag: Tag = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Cafeteria',
  description: 'Food is good',
};

const user: User = {
  id: 2,
  name: 'Test User 1',
  profile_img: '',
  password: 'pw',
  email: 'user@app.com',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const admin: User = {
  id: 1,
  name: 'Admin',
  email: 'admin@app.com',
  profile_img: '',
  password: 'Password123',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const JWT = auth.jwt({ id: user.id });
const mockJWT = (success: boolean) => {
  if (success) {
    mockDb.access.users.select.mockResolvedValueOnce(user as any);
  } else {
    mockDb.access.users.select.mockRejectedValueOnce(new Error('No suck user'));
  }
};

const ADMIN_JWT = auth.jwt({ id: admin.id });
const mockAdminJWT = (success: boolean) => {
  if (success) {
    mockDb.access.users.select.mockResolvedValueOnce(admin as any);
  } else {
    mockDb.access.users.select.mockRejectedValueOnce(new Error('No suck user'));
  }
};

/**
 * Tests for POST method on route /tags
 */
describe('POST /tags/', () => {
  test('Route should create and return tag with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action
    mockDb.access.tags.create.mockResolvedValue(tag as any);

    // Action
    const res = await request(app)
      .post('/tags/')
      .auth(ADMIN_JWT, { type: 'bearer' })
      .send(tag)
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
      id: 1,
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
    // Mock ADMIN Authentication
    mockJWT(false);

    // Action
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
    // Mock resulting action
    mockDb.access.tags.all.mockResolvedValue([tag]);

    // Action
    const res = await request(app)
      .get('/tags/')
      .send(tag)
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
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
    // Mock ADMIN Authentication
    mockJWT(true);
    // Mock resulting action
    mockDb.access.tags.select.mockRejectedValue(new NoSuchResource('tag'));

    // Action
    const res = await request(app)
      .get('/tags/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such tag exists',
      status: 404,
    });
  });

  test('Route should return tag with status 200', async () => {
    // Mock ADMIN Authentication
    mockJWT(true);
    // Mock resulting action
    mockDb.access.tags.select.mockResolvedValue(tag as any);

    // Action
    const res = await request(app)
      .get('/tags/1')
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock ADMIN Authentication
    mockJWT(false);

    // Actions
    await request(app).get('/tags/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /tags
 */
describe('DELETE /tags/:id', () => {
  test('Route should 404 with missing tag', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action
    mockDb.access.tags.remove.mockRejectedValue(new NoSuchResource('tag'));

    // Action
    const res = await request(app)
      .delete('/tags/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such tag exists',
      status: 404,
    });
  });

  test('Route should return tag with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action
    mockDb.access.tags.remove.mockResolvedValue(tag as any);

    // Action
    const res = await request(app)
      .delete('/tags/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Cafeteria',
      description: 'Food is good',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock ADMIN Authentication
    mockJWT(false);

    await request(app).delete('/tags/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /tags
 */
describe('PUT /tags/:id', () => {
  test('Route should 404 with missing tag', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action
    const newTag = { name: 'Test Engineer 2' };
    mockDb.access.tags.update.mockRejectedValue(new NoSuchResource('tag'));

    // Action
    const res = await request(app)
      .put('/tags/1')
      .send(newTag)
      .auth(JWT, { type: 'bearer' })
      // .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such tag exists',
      status: 404,
    });
  });

  test('Route should return tag with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action
    const updateResult: Tag = {
      id: 1,
      created_at: timestamp,
      updated_at: timestamp,
      name: 'Restaurant',
      description: 'Food is great',
    };
    const newTag = { name: 'Restaurant' };
    mockDb.access.tags.update.mockResolvedValue(updateResult);

    // Action
    const res = await request(app)
      .put('/tags/1')
      .send(newTag)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Restaurant',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(false);

    // Action
    await request(app).delete('/tags/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
