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
 *
 * @param ctx
 * @returns
 */
const all = async (ctx: PrismaContext) => {
  const roles = await ctx.prisma.role.findMany();
  log.debug(`Found ${roles.length} users: [${roles.map((it) => it.name)}]`);
  return roles;
};

/**
 *
 * @param ctx
 * @returns
 */
const allRolesWithUsers = async (ctx: PrismaContext) => {
  const roles = await ctx.prisma.role.findMany({ include: users });
  log.debug(`Found ${roles.length} users: [${roles.map((it) => it.name)}]`);
  return roles;
};

/**
 *
 * @param roleId
 * @param ctx
 * @returns
 */
const selectWithUsers = async (roleId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.role.findFirstOrThrow({
      where: { id: roleId },
      include: users,
    });
    return result;
  } catch (error) {
    throw new NoSuchResource('role');
  }
};

/**
 *
 * @param roleId
 * @param ctx
 * @returns
 */
const select = async (roleId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.role.findFirstOrThrow({ where: { id: roleId } });
  } catch (error) {
    throw new NoSuchResource('role');
  }
};

/**
 *
 * @param from
 * @param ctx
 * @returns
 */
const create = async (from: NewRole, ctx: PrismaContext) => {
  const user = await ctx.prisma.role.create({
    data: { name: from.name },
  });
  log.info('Created new role: ' + JSON.stringify(user));
  return user;
};

export default { all, create, select, allRolesWithUsers, selectWithUsers };
