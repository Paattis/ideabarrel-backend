import { PrismaClient, Role, User } from '@prisma/client';
import { NoSuchResource } from '../../src/utils/errors';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DbType, dbMock } from '../../src/db/Database';

const prismaMock = mockDeep<PrismaClient>();
const db = dbMock(DbType.MOCK_PRISMA, prismaMock);
afterEach(() => mockReset(prismaMock));

const timestamp = new Date();
const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};
const user1: User = {
  profile_img: '',
  id: 1,
  name: 'Test User 1',
  email: 'user@app.com',
  password: 'pw',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};
const user2: User = {
  profile_img: '',
  id: 2,
  email: 'user2@app.com',
  name: 'Test User 2',
  password: 'pw',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

describe('Users database access client', () => {
  test('Should return user by its id', async () => {
    prismaMock.user.findFirst.mockResolvedValue(user1);
    await expect(db.users.select(1)).resolves.toMatchObject({ id: 1 });
  });

  test('Should throw error when no user is found', async () => {
    prismaMock.user.findFirst.mockRejectedValue(new NoSuchResource('user'));
    await expect(db.users.select(1)).rejects.toThrow(NoSuchResource);
  });

  test('Should remove existing user', async () => {
    prismaMock.user.delete.mockResolvedValue(user1);
    const user = await db.users.remove(1);

    expect(user).not.toBeNull();
    expect(user).toMatchObject({ id: 1 });
  });

  test('Should throw error', async () => {
    prismaMock.user.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.users.remove(666)).rejects.toThrow(NoSuchResource);
  });

  test('Should return existing users', async () => {
    prismaMock.user.findMany.mockResolvedValue([user1, user2]);
    const result = await db.users.all();

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(2);

    expect(result.find((it) => it.id === 1)).toMatchObject({
      id: 1,
      name: 'Test User 1',
      role_id: 1,
    });
    expect(result.find((it) => it.id === 2)).toMatchObject({
      id: 2,
      name: 'Test User 2',
      role_id: 1,
    });
  });

  test('Should create new user', async () => {
    prismaMock.role.findFirstOrThrow.mockResolvedValue(role);
    prismaMock.user.create.mockResolvedValue(user1);

    await expect(db.users.create(user1)).resolves.toMatchObject({
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('should fetch user from database', async () => {
    prismaMock.user.findFirst.mockResolvedValue(user1);
    await expect(db.users.selectByEmailSecret(user1.name)).resolves.toMatchObject({
      name: 'Test User 1',
      password: 'pw',
    });
  });

  test('should fetch user from database', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    await expect(db.users.selectByEmailSecret(user1.name)).resolves.toBeNull();
  });
});
