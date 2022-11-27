import { DeepMockProxy, mockReset } from 'jest-mock-extended';
import request from 'supertest';
import app from '../../src/app';
import { Database, DbType, getClient } from '../../src/db/Database';
import auth from '../../src/utils/auth';

const mockDb: DeepMockProxy<Database> = getClient(
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

describe('POST /auth/login', () => {
  test('Route should return 404 when user is not found', async () => {
    // Mock resulting actions
    mockDb.access.users.selectByEmailSecret.mockResolvedValue(null);

    // Action
    const res = await request(app).post('/auth/login').send(login);

    // Result
    expect(res.statusCode).toBe(404);
  });

  test('Route should return 400 when user password is wrong', async () => {
    // Mock resulting actions
    const user = {
      id: 1,
      name: 'Test User',
      email: 'user@app.com',
      profile_img: '',
      password: await auth.hash('password'),
      role_id: 1,
    };
    mockDb.access.users.selectByEmailSecret.mockResolvedValue(user as any);

    // Action
    const res = await request(app).post('/auth/login').send(incorrectLogin);

    // Result
    expect(res.statusCode).toBe(400);
  });

  test('Route should return 200 when user password is right', async () => {
    // Mock resulting actions
    const user = {
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
    mockDb.access.users.selectByEmailSecret.mockResolvedValue(user as any);

    // Action
    const res = await request(app).post('/auth/login').send(login).expect(200);

    // Result
    expect(res.body).toMatchObject({
      result: {
        name: 'Test User',
        email: 'user@app.com',
        id: 1,
      },
    });
    expect(res.body.token).not.toBeNull();
  });
});
