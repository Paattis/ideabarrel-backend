import { User } from '@prisma/client';
import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import request from 'supertest';
import app from '../../src/app';
import { Database, DbType, dbMock } from '../../src/db/Database';
import auth from '../../src/utils/auth';
import { NoSuchResource } from '../../src/utils/errors';

const mockDb: DeepMockProxy<Database> = dbMock(
  DbType.MOCK_CLIENT
) as DeepMockProxy<Database>;
afterEach(() => mockReset(mockDb));

const timestamp = new Date();

const admin: User = {
  id: 1,
  name: 'Admin',
  email: 'admin@app.com',
  profile_img: '',
  password: 'Password123',
  role_id: auth.ADMIN_ID,
  created_at: timestamp,
  updated_at: timestamp,
};

const user: User = {
  id: 10,
  name: 'Test User',
  email: 'user1@app.com',
  profile_img: '',
  password: 'Password123',
  role_id: 2,
  created_at: timestamp,
  updated_at: timestamp,
};

const updatedUser: User = {
  id: 10,
  name: 'Updated User',
  email: 'user2@app.com',
  profile_img: '',
  password: 'Password123',
  role_id: 6,
  created_at: timestamp,
  updated_at: timestamp,
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
    mockDb.users.select.mockResolvedValueOnce({ ...admin, role: { id: 1 } } as any);
  } else {
    mockDb.users.select.mockRejectedValueOnce(new Error('No suck user'));
  }
};

/**
 * Tests for POST method on route /users
 */
describe('POST /users/', () => {
  test('Route should create and return user with status 200', async () => {
    // Mock Request prerequisites
    mockDb.users.emailIsSameOrUnique.mockResolvedValue(true);
    mockDb.roles.exists.mockResolvedValue(true);
    // Mock resulting action
    mockDb.users.create.mockResolvedValue(user as any);

    // Action
    const res = await request(app)
      .post('/users/')
      .auth(JWT, { type: 'bearer' })
      .send(user);

    // Results
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test User',
      role_id: 2,
      email: 'user1@app.com',
    });
  });

  test('Route should return 400 when email is taken', async () => {
    // Mock Request prerequisites
    mockDb.users.emailExists.mockResolvedValue(true);
    mockDb.roles.exists.mockResolvedValue(true);

    // Action
    const res = await request(app)
      .post('/users/')
      .auth(JWT, { type: 'bearer' })
      .send(user);

    // Results
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      msg: 'Invalid request body',
      status: 400,
      errors: [
        {
          param: 'email',
          msg: 'is already taken',
          value: 'user1@app.com',
        },
      ],
    });
  });

  test('Route should return 400 when role id doesnt exist', async () => {
    // Mock Request prerequisites
    mockDb.users.emailIsSameOrUnique.mockResolvedValue(true);
    mockDb.roles.exists.mockResolvedValue(false);

    // Action
    const res = await request(app)
      .post('/users/')
      .auth(JWT, { type: 'bearer' })
      .send({ ...user, role_id: 1000 });

    // Results
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      msg: 'Invalid request body',
      status: 400,
      errors: [
        {
          param: 'role_id',
          msg: 'doesnt exist',
          value: 1000,
        },
      ],
    });
  });
});

/**
 * Tests for DELETE method on route /users
 */
describe('DELETE /users/:id', () => {
  test('Route should delete and return user with status 200', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    mockDb.users.userOwns.mockResolvedValue(true);
    // Mock Resulting action
    mockDb.users.remove.mockResolvedValue(user as any);

    // Action
    const res = await request(app).delete('/users/2').auth(ADMIN_JWT, { type: 'bearer' });

    // Results
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Test User',
      role_id: 2,
    });
  });

  test('Route return 404 on missing user', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    mockDb.users.userOwns.mockResolvedValue(true);
    // Mock Resulting action
    mockDb.users.remove.mockRejectedValue(new NoSuchResource('user'));

    // Action
    const res = await request(app)
      .delete('/users/1000')
      .auth(ADMIN_JWT, { type: 'bearer' });

    // Results
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({
      msg: 'No such user exists',
      status: 404,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock Authentication
    mockJWT(false);

    // Action
    await request(app)
      .delete('/users/10')
      .auth('NOT_JWT', { type: 'bearer' })
      .expect(401);
  });

  test('Route should fail to delete user and return error with status 403', async () => {
    // Mock Authentication
    mockJWT(true);
    mockDb.users.userOwns.mockRejectedValue(false);

    // Action
    const res = await request(app).delete('/users/2').auth(JWT, { type: 'bearer' });

    // Results
    expect(res.statusCode).toBe(403);
  });
});

/**
 * Tests for GET method on route /users/:id
 */
describe('GET /users/:id', () => {
  test('Route should return User by specified id and status code of 200', async () => {
    // Mock Authentication
    mockJWT(true);
    // Mock Resulting action
    mockDb.users.select.mockResolvedValue(user as any);

    // Action
    const res = await request(app)
      .get('/users/10')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      id: 10,
      name: 'Test User',
      role_id: 2,
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock Authentication
    mockJWT(true);

    // Action
    const res = await request(app).get('/users/10').auth('NOT_JWT', { type: 'bearer' });

    // Results
    expect(res.statusCode).toBe(401);
  });

  test('Route should return no user, and status code of 404', async () => {
    mockJWT(true);

    mockDb.users.select.mockRejectedValue(new NoSuchResource('user'));
    await request(app).get('/users/10').auth(JWT, { type: 'bearer' }).expect(404);
  });
});

/**
 * Tests for GET method on route /users
 */
describe('GET /users/', () => {
  test('Route should return array of users and status code of 200', async () => {
    // Mock Authentication
    mockJWT(true);
    // Mock Resulting action
    mockDb.users.all.mockResolvedValue([user as any]);

    // Action
    const res = await request(app)
      .get('/users/')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    // Results
    expect((res.body as any[]).length).toBeGreaterThan(0);
  });

  test('Route should return empty array and status code of 200', async () => {
    // Mock Authentication
    mockJWT(true);
    // Mock Resulting action
    mockDb.users.all.mockResolvedValue([]);

    // Action
    const res = await request(app)
      .get('/users/')
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject([]);
  });
});

/**
 * Tests for PUT method on route /users
 */
describe('PUT /users/:id', () => {
  test('Route should 404 with missing user', async () => {
    // Mock ADMIN Authentication
    mockAdminJWT(true);
    // Mock Request prerequisites
    mockDb.users.emailIsSameOrUnique.mockResolvedValue(true);
    mockDb.roles.exists.mockResolvedValue(true);
    // Mock Resulting action
    mockDb.users.update.mockRejectedValue(new NoSuchResource('user'));

    // Action
    const res = await request(app)
      .put('/users/1000')
      .send(updatedUser)
      .auth(ADMIN_JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(404);

    // Results
    expect(res.body).toMatchObject({
      msg: 'No such user exists',
      status: 404,
    });
  });

  test('Route should return 400 when role id doesnt exist', async () => {
    // Mock Authentication
    mockJWT(true);
    mockDb.users.userOwns.mockResolvedValue(true);
    // Mock Request prerequisites
    mockDb.users.emailIsSameOrUnique.mockResolvedValue(true);
    mockDb.roles.exists.mockResolvedValue(false);

    // Action
    const res = await request(app)
      .put('/users/10')
      .auth(JWT, { type: 'bearer' })
      .send({ ...user, role_id: 1000 });

    // Results
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      msg: 'Invalid request body',
      status: 400,
      errors: [
        {
          location: 'body',
          param: 'role_id',
          msg: 'doesnt exist',
          value: 1000,
        },
      ],
    });
  });

  test('Route should return new user with status 200', async () => {
    // Mock Authentication
    mockJWT(true);
    mockDb.users.userOwns.mockResolvedValue(true);
    // Mock Request prerequisites
    mockDb.users.emailIsSameOrUnique.mockResolvedValue(true);
    mockDb.roles.exists.mockResolvedValue(true);
    // Mock Resulting action
    mockDb.users.update.mockResolvedValue(updatedUser as any);

    // Action
    const res = await request(app)
      .put('/users/10')
      .send(updatedUser)
      .auth(JWT, { type: 'bearer' })
      .expect('Content-Type', /json/)
      .expect(200);

    // Results
    expect(res.body).toMatchObject({
      id: 10,
      name: 'Updated User',
      email: 'user2@app.com',
    });
  });

  test('Route should return 401 on invalid JWT', async () => {
    // Mock Authentication
    mockJWT(false);

    // Action
    await request(app).delete('/users/1').auth('NOT_JWT', { type: 'bearer' }).expect(401);
  });
});

/**
 * Tests for POST method on route /users/email/free
 */
describe('POST /users/email/free', () => {
  test('Route should return response with true and status code of 200, when email is free', async () => {
    // Mock Resulting action
    mockDb.users.emailIsSameOrUnique.mockResolvedValue(true);

    // Action
    const res = await request(app)
      .post('/users/email/free')
      .send({ email: 'user2@app.com' })
      .expect(200);

    // Results
    expect(res.body).toMatchObject({ free: true });
  });

  test('Route should return response with false and status code of 200, when email is taken', async () => {
    // Mock Resulting action
    mockDb.users.emailExists.mockResolvedValue(true);

    // Action
    const res = await request(app)
      .post('/users/email/free')
      .send({ email: 'user@app.com' })
      .expect(200);

    // Results
    expect(res.body).toMatchObject({ free: false });
  });

  test('Route should return response with errors and status code of 400, request is wrong', async () => {
    // Mock Resulting action

    // Action
    const res = await request(app)
      .post('/users/email/free')
      .send({ email: '' })
      .expect(400);

    // Results
    expect(res.body).toMatchObject({
      errors: [
        {
          param: 'email',
          msg: 'must not be empty',
        },
        {
          param: 'email',
          msg: 'is not valid email address',
        },
      ],
      msg: 'Invalid request body',
      status: 400,
    });
  });
});
