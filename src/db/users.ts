import { Comment, Idea, Prisma, Role, User } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';
import secrets from '../utils/secrets';

export type PublicUser = {
  comments: Comment[];
  name: string;
  role: Role;
  created_at: string;
  ideas: Idea[];
};

const publicFields = {
  comments: { select: { content: true, id: true, created_at: true, idea: true } },
  name: true,
  id: true,
  role: { select: { name: true, id: true } },
  created_at: true,
  ideas: { select: { id: true } },
};

/**
 * Data to build new user from.
 */
export interface UserData {
  name: string;
  role_id: number;
  password: string;
}

/**
 * Select all users.
 *
 * @param ctx PrismaContext
 * @returns Array of {@link PublicUser}s
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.user.findMany({ select: publicFields });
};

const selectByUsernameSecret = async (username: string, ctx: PrismaContext) => {
  return await ctx.prisma.user.findFirstOrThrow({ where: { name: username } });
};

/**
 * Select single user.
 *
 * @param userId user id.
 * @param ctx PrismaContext
 * @throws on no user found {@link NoSuchResource}
 * @returns User as a {@link PublicUser}
 */
const select = async (userId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.user.findFirstOrThrow({
      where: { id: userId },
      select: publicFields,
    });
  } catch (err) {
    throw new NoSuchResource('user', `No user with id: ${userId}`);
  }
};

/**
 * Removes specified user and returns that object.
 *
 * @param userId user id.
 * @param ctx PrismaContext
 * @throws on no user found {@link NoSuchResource}
 * @returns removed user as a {@link PublicUser}
 */
const remove = async (userId: number, ctx: PrismaContext) => {
  try {
    const user = await ctx.prisma.user.delete({
      where: { id: userId },
      select: publicFields,
    });
    if (user === null) throw 'Missing record';
    return user;
  } catch (err) {
    throw new NoSuchResource('user', `No user with id: ${userId}`);
  }
};

/**
 * Tries to creates user from specified prototype object.
 *
 * @param from New user prototype
 * @param ctx Prisma database context
 * @throws on broken relations {@link BadRequest}
 * @returns New User as a {@link PublicUser}
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
    data: { ...from, password: await secrets.hash(from.password) },
    select: publicFields,
  });

  log.debug('Created new user: ' + JSON.stringify(user));
  return user;
};

/**
 * Update existing user and return new instance.
 *
 * @param from New user prototype
 * @param userId Id of the user.
 * @param ctx Prisma database context
 * @throws On no user foun {@link NoSuchResource}
 * @returns User as a {@link PublicUser}
 */
const update = async (from: UserData, userId: number, ctx: PrismaContext) => {
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
      where: { id: userId },
      data: {
        name: from.name,
        role_id: from.role_id,
      },
      select: publicFields,
    });
    return user;
  } catch (err) {
    throw new NoSuchResource('user');
  }
};

const updatePassword = async (userId: number, password: string, ctx: PrismaContext) => {
  try {
    const user = await ctx.prisma.user.update({
      where: { id: userId },
      data: { password: password },
      select: publicFields,
    });
    return user;
  } catch (err) {
    throw new NoSuchResource('user');
  }
};

export default {
  all,
  remove,
  create,
  select,
  update,
  selectByUsername: selectByUsernameSecret,
  updatePassword,
};
