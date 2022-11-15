import { Comment, Idea, Prisma, Role, User } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

const everything = { role: true, comments: true, ideas: true };

/**
 * Data to build new user from.
 */
export interface UserData {
  name: string;
  role_id: number;
}

/**
 * Union type of User and his/her role.
 */
export type UserWithRole = User & { role: Role };

/**
 * Union type containing all of the rows linked to 
 * the user.
 */
export type RichUser = UserWithRole & { comments: Comment[]; ideas: Idea[] };

/**
 * Select all users.
 *
 * @param ctx PrismaContext
 * @returns Array of {@link RichUser}s
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.user.findMany({ include: everything });
};

/**
 * Select single user.
 *
 * @param userId user id.
 * @param ctx PrismaContext
 * @throws on no user found {@link NoSuchResource}
 * @returns User as a {@link RichUser}
 */
const select = async (userId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.user.findFirstOrThrow({
      where: { id: userId },
      include: everything,
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
 * @returns removed user as a {@link RichUser}
 */
const remove = async (userId: number, ctx: PrismaContext) => {
  try {
    const user: User = await ctx.prisma.user.delete({
      where: { id: userId },
      include: everything,
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
 * @returns New User as a {@link RichUser}
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
 * @returns User as a {@link RichUser}
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
      data: from,
      include: everything,
    });
    return user;
  } catch (err) {
    throw new NoSuchResource('user');
  }
};

export default { all, remove, create, select, update };
