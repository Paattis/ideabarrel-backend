import { Role, User } from '@prisma/client';
import usersClient from '../../src/db/users';
import {
  MockPrismaContext,
  PrismaContext,
  createMockContext,
  swapToAppContext,
} from '../../src/db/context';

let mockCtx: MockPrismaContext;
let ctx: PrismaContext;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = mockCtx as unknown as PrismaContext;
});

afterAll(() => {
  swapToAppContext();
});

const timestamp = new Date();
const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};
const user1: User = {
  id: 1,
  name: 'Test User 1',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};
const user2: User = {
  id: 2,
  name: 'Test User 2',
  role_id: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

describe('Users database access client', () => {
  test('Should return user by its id', async () => {
    mockCtx.prisma.user.findFirst.mockResolvedValue(user1);
    await expect(usersClient.select(1, ctx)).resolves.toMatchObject({ id: 1 });
  });

  test('Should throw error when no user is found', async () => {
    await expect(usersClient.select(1, ctx)).rejects.toThrowError('No such user exists.');
  });

  test('Should remove existing user', async () => {
    mockCtx.prisma.user.delete.mockResolvedValue(user1);
    const user = await usersClient.remove(1, ctx);

    expect(user).not.toBeNull();
    expect(user).toMatchObject({ id: 1 });
  });

  test('Should throw error', async () => {
    expect(usersClient.remove(666, ctx)).rejects.toThrowError('No such user exists.');
  });

  test('Should return existing users', async () => {
    mockCtx.prisma.user.findMany.mockResolvedValue([user1, user2]);
    const result = await usersClient.all(ctx);

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
    // This is pretty nasty way of mocking... I have to know what
    // prisma.user.create uses internally.
    mockCtx.prisma.role.findFirst.mockResolvedValue(role);
    mockCtx.prisma.user.create.mockResolvedValue(user1);

    await expect(usersClient.create(user1, ctx)).resolves.toMatchObject({
      name: 'Test User 1',
      role_id: 1,
    });
  });

  test('Should throw when role with specified id does not exist', async () => {
    mockCtx.prisma.role.findFirst.mockResolvedValue(null);
    mockCtx.prisma.user.create.mockResolvedValue(user1);
    await expect(usersClient.create(user1, ctx)).rejects.toThrowError(
      'Invalid role_id: 1'
    );
  });
});
