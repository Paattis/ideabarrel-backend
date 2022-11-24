import { Role, User } from '@prisma/client';
import { log } from '../logger/log';
import { NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface RoleFields {
  name: string;
}

export type RoleWithUsers = Role & { users: User[] };
const publicFields = {
  id: true,
  name: true,
  users: { select: { name: true, id: true } },
};

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
  return await ctx.prisma.role.findMany({ select: publicFields });
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
      select: publicFields,
    });
  } catch (err) {
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
  } catch (err) {
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
const create = async (from: RoleFields, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.role.create({
      data: { name: from.name },
      select: publicFields,
    });
    log.info('Created new role: ' + JSON.stringify(result));
    return result;
  } catch (err) {
    throw new Error('Something went wrong');
  }
};

const remove = async (roleId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.role.delete({
      where: { id: roleId },
      select: publicFields,
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('role', `No role with id: ${roleId}`);
  }
};

const update = async (roleId: number, role: RoleFields, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.role.update({
      where: { id: roleId },
      data: role,
      select: publicFields,
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('role', `No role with id: ${roleId}`);
  }
};

export default {
  all,
  create,
  select,
  update,
  allRolesWithUsers,
  selectWithUsers,
  remove,
};
