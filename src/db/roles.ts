import { Role, User } from '@prisma/client';
import { log } from '../logger/log';
import { NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface NewRole {
  name: string;
}

export type RoleWithUsers = Role & { users: User[] };
const users = { users: true };

/**
 * Get all roles.
 * 
 * @param ctx Prisma database context
 * @returns Array of {@link Role}s
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.role.findMany();
};

/**
 * Get all roles, each enriched with users linked
 * liked to them.
 * 
 * @param ctx Prisma database context
 * @returns Array of {@link RoleWithUsers}'
 */
const allRolesWithUsers = async (ctx: PrismaContext) => {
  return await ctx.prisma.role.findMany({ include: users });
};

/**
 * Get single role with users linked to it.
 * 
 * @param roleId id of the role
 * @param ctx Prisma database context
 * @throws on missing role {@link NoSuchResource} error.
 * @returns Role as {@link RoleWithUsers}
 */
const selectWithUsers = async (roleId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.role.findFirstOrThrow({
      where: { id: roleId },
      include: users,
    });
  } catch (error) {
    throw new NoSuchResource('role');
  }
};

/**
 * Get single role.
 * 
 * @param roleId Id of the role
 * @param ctx Prisma database context
 * @throws on missing role {@link NoSuchResource} error.
 * @returns Role
 */
const select = async (roleId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.role.findFirstOrThrow({ where: { id: roleId } });
  } catch (error) {
    throw new NoSuchResource('role');
  }
};

/**
 * Create new Role and store it to database.
 * 
 * @param from object to build new Role from.
 * @param ctx Prisma database context
 * @returns Created Role
 */
const create = async (from: NewRole, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.role.create({
      data: { name: from.name },
    });
    log.info('Created new role: ' + JSON.stringify(result));
    return result;
  } catch (error) {
    throw new Error('Something went wrong')
  }
};

export default { all, create, select, allRolesWithUsers, selectWithUsers };
