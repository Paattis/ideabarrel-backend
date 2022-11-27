import { PrismaClient, Role } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { DbType, getClient } from '../../src/db/Database';
import { NoSuchResource } from '../../src/utils/errors';

const prismaMock = mockDeep<PrismaClient>();
const db = getClient(DbType.MOCK_PRISMA, prismaMock);
afterEach(() => mockReset(prismaMock));

const timestamp = new Date();
const role: Role = {
  id: 1,
  created_at: timestamp,
  updated_at: timestamp,
  name: 'Test Engineer',
};

describe('Roles client remove', () => {
  test('Should remove existing user', async () => {
    prismaMock.role.delete.mockResolvedValue(role);
    expect(await db.access.roles.remove(1)).toMatchObject({
      id: 1,
      name: 'Test Engineer',
    });
  });

  test('Should throw error when role is not found', async () => {
    prismaMock.role.delete.mockRejectedValue(new Error('Mock Error'));
    expect(db.access.roles.remove(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Roles client get by id', () => {
  test('Should return role by its id', async () => {
    prismaMock.role.findFirstOrThrow.mockResolvedValue(role);
    await expect(db.access.roles.select(1)).resolves.toMatchObject({
      id: 1,
      name: 'Test Engineer',
    });
  });

  test('Should throw error when no role is found', async () => {
    prismaMock.role.findFirstOrThrow.mockRejectedValue(new Error('Mock Error'));
    await expect(db.access.roles.select(1)).rejects.toThrow(NoSuchResource);
  });
});

describe('Roles client get all', () => {
  test('Should return existing roles', async () => {
    prismaMock.role.findMany.mockResolvedValue([role]);
    const result = await db.access.roles.all();

    expect(result).toBeInstanceOf(Array<Role>);
    expect(result.length).toBe(1);
  });

  test('Should return empty when no roles exist', async () => {
    prismaMock.role.findMany.mockResolvedValue([]);
    const result = await db.access.roles.all();

    expect(result).toBeInstanceOf(Array<Role>);
    expect(result.length).toBe(0);
  });
});

describe('Roles client create', () => {
  test('Should create new role', async () => {
    prismaMock.role.create.mockResolvedValue({ ...role, name: 'asd' });
    const fields = {
      name: 'asd',
    };
    await expect(db.access.roles.create(fields)).resolves.toMatchObject({
      name: 'asd',
    });
  });
});
