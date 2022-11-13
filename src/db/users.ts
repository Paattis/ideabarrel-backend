import { Role, User } from '@prisma/client';
import { log } from '../logger/log';
import { PrismaContext } from './context';

export interface UserData {
  name: string;
  role_id: number;
}

/**
 * Select all users.
 *
 * @param ctx PrismaContext
 * @returns Array of all users.
 */
const all = async (ctx: PrismaContext) => {
  const users = await ctx.prisma.user.findMany();
  log.debug(`Found ${users.length} users: [${users.map((it) => it.id)}]`);
  return users;
};

/**
 * Select single user.
 *
 * @param id user id.
 * @param ctx PrismaContext
 * @throws Error on not found.
 * @returns User
 */
const select = async (id: number, ctx: PrismaContext) => {
  const user: User | null = await ctx.prisma.user.findFirst({ where: { id } });
  if (user == null) {
    log.error(`No user exists with id of ${id}`);
    throw new Error('No such user exists.');
  }
  return user;
};

/**
 * Removes specified user.
 *
 * @param id user id.
 * @param ctx PrismaContext
 * @throws Error on not user found.
 * @returns removed user object.
 */
const remove = async (id: number, ctx: PrismaContext) => {
  const user: User | null = await ctx.prisma.user.delete({ where: { id } });
  if (user != null) {
    log.info(`Deleted user ${JSON.stringify(user)}`);
    return user;
  } else {
    log.error(`No user with id: ${id}`);
    throw new Error('No such user exists.');
  }
};

/**
 * Tries to creates user from specified prototype object.
 *
 * @param from New user prototype
 * @param ctx prisma context
 * @throws Error when role_id does not match with any existing role ids
 * @returns Promise<User> Created user object.
 */
const create = async (from: UserData, ctx: PrismaContext) => {
  // Check for specified role.
  const role: Role | null = await ctx.prisma.role.findFirst({
    where: { id: from.role_id },
  });
  if (role == null) {
    log.error('Invalid role_id: ' + from.role_id);
    throw new Error('Invalid role_id: ' + from.role_id);
  } else {
    log.debug(`Role is ${role.name}`);
  }

  // Create user and store it to database.
  const user = await ctx.prisma.user.create({
    data: {
      name: from.name,
      role_id: from.role_id,
    },
  });

  log.info('Created new user: ' + JSON.stringify(user));
  return user;
};

const update = async (from: UserData, id: number, ctx: PrismaContext) => {
  try {
    const user = await ctx.prisma.user.update({ where: { id }, data: from });
    log.info('Updated user: ' + JSON.stringify(user));
    return user;
  } catch (error) {
    throw new Error('No such user exists.');
  }
};

export default { all, remove, create, select, update };
