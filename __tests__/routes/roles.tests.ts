import { Role, User } from '@prisma/client';
import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import request from 'supertest';
import app from '../../src/app';
import { Database, DbType, getClient } from '../../src/db/client';
import auth from '../../src/utils/auth';
import { NoSuchResource } from '../../src/utils/errors';

const mockDb: DeepMockProxy<Database> = getClient(
  DbType.MOCK_CLIENT
) as DeepMockProxy<Database>;
afterEach(() => mockReset(mockDb));

const timestamp = new Date();
const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};

const updatedRole: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Updated Engineer',
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
 * Tests for POST method on route /roles
 */
describe('POST /roles/', () => {
  test('Route should create and return user with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action
    mockDb.access.roles.create.mockResolvedValue(role as any);

    // Action
    const res = await request(app)
      .post('/roles/')
      .auth(JWT, { type: 'bearer' })
      .send(role)
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Test Engineer',
      id: 1,
    });
  });

  test('Route should return 401 with invalid JWT', async () => {
     // Mock Authentication
    mockJWT(false);

    // Action
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
    mockDb.access.roles.all.mockResolvedValue([role]);

    // Action
    const res = await request(app)
      .get('/roles/')
      .send(role)
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
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
    // Mock Authentication
    mockJWT(true);
    mockDb.access.roles.select.mockRejectedValue(new NoSuchResource('role'));

    // Action
    const res = await request(app)
      .get('/roles/10')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such role exists',
      status: 404,
    });
  });

  test('Route should return role with status 200', async () => {
    // Mock Authentication
    mockJWT(true);
    mockDb.access.roles.select.mockResolvedValue(role);

    // Action
    const res = await request(app)
      .get('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Test Engineer',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock Authentication
    mockJWT(false);

    // Action
    const res = await request(app).get('/roles/1').auth('NOT_JWT', { type: 'bearer' })

    // Results
    expect(res.statusCode).toBe(401);
  });
});

/**
 * Tests for DELETE method on route /roles
 */
describe('DELETE /roles/:id', () => {
  test('Route should 404 with missing role', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action.
    mockDb.access.roles.remove.mockRejectedValue(new NoSuchResource('role'));

    // Action
    const res = await request(app)
      .delete('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such role exists',
      status: 404,
    });
  });

  test('Route should return role with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action.
    mockDb.access.roles.remove.mockResolvedValue(role as any);

    // Action
    const res = await request(app)
      .delete('/roles/1')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Test Engineer',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock ADMIN Authentication
    mockJWT(false);

    // Action
    await request(app).delete('/roles/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for DELETE method on route /roles
 */
describe('PUT /roles/:id', () => {
  test('Route should 404 with missing role', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action.
    mockDb.access.roles.update.mockRejectedValue(new NoSuchResource('role'));

    // Action
    const res = await request(app)
      .put('/roles/1')
      .send(updatedRole)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such role exists',
      status: 404,
    });
  });

  test('Route should return role with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock resulting action.
    mockDb.access.roles.update.mockResolvedValue(updatedRole as any);

    // Action
    const res = await request(app)
      .put('/roles/1')
      .send(updatedRole)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      name: 'Updated Engineer',
      id: 1,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    mockAdminJWT(false);
    // Action
    await request(app).delete('/roles/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});
