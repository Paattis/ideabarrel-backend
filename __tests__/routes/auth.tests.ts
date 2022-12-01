import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import request from 'supertest';
import app from '../../src/app';
import { Database, DbType, dbMock } from '../../src/db/Database';
import auth from '../../src/utils/auth';

const mockDb: DeepMockProxy<Database> = dbMock(
  DbType.MOCK_CLIENT
) as DeepMockProxy<Database>;
afterEach(() => mockReset(mockDb));

const login = {
  password: 'password',
  email: 'user@app.com',
};

const incorrectLogin = {
  password: 'wrong-password',
  email: 'user@app.com',
};

const timestamp = new Date();
const user = {
  id: 1,
  name: 'Test User',
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
    mockDb.users.select.mockResolvedValueOnce(user as any);
  } else {
    mockDb.users.select.mockRejectedValueOnce(new Error('No such user'));
  }
};

describe('POST /auth/login/token', () => {
  test('Route should return 200 when user token is valid', async () => {
    // Mock resulting actions
    mockJWT(true);
    // Action
    const res = await request(app)
      .post('/auth/login/token')
      .auth(JWT, { type: 'bearer' })
      .expect(200);

    // Result
    expect(res.body).toMatchObject({
      name: 'Test User',
      email: 'user@app.com',
      id: 1,
      token: JWT,
    });
  });

  test('Route should return 401 when user token is invalid', async () => {
    // Mock resulting actions
    mockJWT(false);
    // Action
    await request(app)
      .post('/auth/login/token')
      .auth(JWT, { type: 'bearer' })
      .expect(401);
  });
});

describe('POST /auth/login', () => {
  test('Route should return 404 when user is not found', async () => {
    // Mock resulting actions
    mockDb.users.selectByEmailSecret.mockResolvedValue(null);

    // Action
    const res = await request(app).post('/auth/login').send(login);

    // Result
    expect(res.statusCode).toBe(404);
  });

  test('Route should return 400 when user password is wrong', async () => {
    // Mock resulting actions
    const user2 = {
      id: 1,
      name: 'Test User',
      email: 'user@app.com',
      profile_img: '',
      password: await auth.hash('password'),
      role_id: 1,
    };
    mockDb.users.selectByEmailSecret.mockResolvedValue(user2 as any);

    // Action
    const res = await request(app).post('/auth/login').send(incorrectLogin);

    // Result
    expect(res.statusCode).toBe(400);
  });

  test('Route should return 200 when user password is right', async () => {
    // Mock resulting actions
    const user2 = {
      id: 1,
      name: 'Test User',
      email: 'user@app.com',
      profile_img: '',
      password: await auth.hash('password'),
      role: {
        id: 1,
      },
      role_id: 1,
    };
    mockDb.users.selectByEmailSecret.mockResolvedValue(user2 as any);

    // Action
    const res = await request(app).post('/auth/login').send(login).expect(200);

    // Result
    expect(res.body).toMatchObject({
      name: 'Test User',
      email: 'user@app.com',
      id: 1,
    });
    expect(res.body.token).not.toBeNull();
  });
});
