import { Comment, Idea, Prisma, Role, User } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface UserData {
  name: string;
  role_id: number;
}
export type UserWithRole = User & { role: Role };
export type RichUser = UserWithRole & { comments: Comment[]; ideas: Idea[] };
const everything = { role: true, comments: true, ideas: true };

/**
 * Select all users.
 *
 * @param ctx PrismaContext
 * @returns Array of all users.
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.user.findMany({ include: everything });
};

/**
 * Select single user.
 *
 * @param id user id.
 * @param ctx PrismaContext
 * @throws Error on not found.
 * @returns User {@link RichUser}
 */
const select = async (id: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.user.findFirstOrThrow({
      where: { id: id },
      include: everything,
    });
  } catch (err) {
    throw new NoSuchResource('user', `No user with id: ${id}`);
  }
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
  try {
    const user: User = await ctx.prisma.user.delete({
      where: { id: id },
      include: everything,
    });
    if (user === null) throw 'Missing record';
    return user;
  } catch (err) {
    throw new NoSuchResource('user', `No user with id: ${id}`);
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
  try {
    const role = await ctx.prisma.role.findFirstOrThrow({ where: { id: from.role_id } });
    log.debug(`Role is ${role.name}`);
  } catch (err) {
    throw new BadRequest('No role exists with that id, cant create user.');
  }

  // Create user and store it to database.
  const user = await ctx.prisma.user.create({
    data: {
      name: from.name,
      role_id: from.role_id,
    },
    include: everything,
  });

  log.info('Created new user: ' + JSON.stringify(user));
  return user;
};

const update = async (from: UserData, id: number, ctx: PrismaContext) => {
  try {
    await ctx.prisma.role.findFirstOrThrow({ where: { id: from.role_id } });
  } catch (err) {
    throw new BadRequest(
      'No role with such id. Cant update user.',
      `Missing role ${from.role_id}`
    );
  }
  try {
    const user = await ctx.prisma.user.update({
      where: { id: id },
      data: from,
      include: everything,
    });
    return user;
  } catch (err) {
    throw new NoSuchResource('user');
  }
};

export default { all, remove, create, select, update };
