import { User } from '@prisma/client';
import request from 'supertest';
import app from '../../src/app';
import {
  MockPrismaContext,
  createMockContext,
  swapToMockContext,
} from '../../src/db/context';
import auth from '../../src/utils/auth';

let mockCtx: MockPrismaContext;

beforeEach(() => (mockCtx = createMockContext()));

describe('', () => {
  test('Route should return 404 when user is not found', async () => {
    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findFirst.mockResolvedValue(null);
    await request(app)
      .post('/auth/login')
      .send({
        password: 'asd',
        email: 'user@app.com',
      })
      .expect(404);
  });

  test('Route should return 400 when user password is wrong', async () => {
    const u: User = {
      id: 1,
      name: 'Test User 1',
      email: 'user@app.com',
      profile_img: '',
      password: await auth.hash('password'),
      role_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findFirst.mockResolvedValue(u);
    await request(app)
      .post('/auth/login')
      .send({
        password: 'different',
        email: 'user@app.com',
      })
      .expect(400);
  });

  test('Route should return 200 when user password is right', async () => {
    const u = {
      id: 1,
      name: 'Test User 1',
      email: 'user@app.com',
      profile_img: '',
      password: await auth.hash('password'),
      role: {
        id: 1,
      },
      role_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    swapToMockContext(mockCtx);
    mockCtx.prisma.user.findFirst.mockResolvedValue(u);
    const res = await request(app)
      .post('/auth/login')
      .send({
        password: 'password',
        email: u.email,
      })
      .expect(200);

    expect(res.body).toMatchObject({
      result: {
        name: 'Test User 1',
      },
    });

    expect(res.body.token).not.toBeNull();
  });
});
