import { Role, User } from '@prisma/client';
import rolesClient from '../../src/db/roles';
import {
  MockPrismaContext,
  PrismaContext,
  createMockContext,
  swapToAppContext,
} from '../../src/db/context';
import { NoSuchResource } from '../../src/utils/errors';

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

describe('Roles client remove', () => {
  test('Should remove existing user', async () => {
    mockCtx.prisma.role.delete.mockResolvedValue(role);
    expect(await rolesClient.remove(1, ctx))
        .toMatchObject({id: 1, name: 'Test Engineer'})
  });

  test('Should throw error when role is not found', async () => {
    mockCtx.prisma.role.delete.mockRejectedValue(new Error('Mock Error'));
    expect(rolesClient.remove(1, ctx)).rejects.toThrow(NoSuchResource);
  });
})

describe('Roles client get by id', () => {
  test('Should return role by its id', async () => {
    mockCtx.prisma.role.findFirstOrThrow.mockResolvedValue(role);
    await expect(rolesClient.select(1, ctx)).resolves.toMatchObject({ id: 1, name: 'Test Engineer' });
  });

  test('Should throw error when no role is found', async () => {
    mockCtx.prisma.role.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(rolesClient.select(1, ctx)).rejects.toThrow(NoSuchResource);
  });
})

describe('Roles client get all', () => {
  test('Should return existing roles', async () => {
    mockCtx.prisma.role.findMany.mockResolvedValue([role]);
    const result = await rolesClient.all(ctx);

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no roles exist', async () => {
    mockCtx.prisma.role.findMany.mockResolvedValue([]);
    const result = await rolesClient.all(ctx);

    expect(result).toBeInstanceOf(Array<User>);
    expect(result.length).toBe(0);
  });
})

describe('Roles client create', () => {
  test('Should create new user', async () => {
    mockCtx.prisma.role.create.mockResolvedValue({...role, name: 'asd'});
    const fields = {
      name: 'asd'
    }
    await expect(rolesClient.create(fields, ctx)).resolves.toMatchObject({
      name: 'asd'
    });
  });
})
