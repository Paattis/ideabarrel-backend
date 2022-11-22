import { Comment, Idea, Prisma, Role, User } from '@prisma/client';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { BadRequest, NoSuchResource } from '../utils/errors';
import img from '../utils/img';
import { PrismaContext } from './context';

export type PublicUser = {
  comments: Comment[];
  name: string;
  profile_img: string;
  email: string;
  role: Role;
  id: number;
  created_at: string;
  ideas: Idea[];
};

export const publicFields = {
  comments: { select: { content: true, id: true, created_at: true, idea: true } },
  name: true,
  profile_img: true,
  email: true,
  id: true,
  role: { select: { name: true, id: true } },
  created_at: true,
  ideas:true,
  likes: true
};

/**
 * Data to build new user from.
 */
export interface UserData {
  name: string;
  role_id: number;
  password: string;
  email: string;
  profile_img: string;
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

const selectByEmailSecret = async (email: string, ctx: PrismaContext) => {
  return await ctx.prisma.user.findFirst({
    where: { email: email },
    select: { ...publicFields, password: true },
  });
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
    throw new NoSuchResource('user');
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
    if (user === null) throw new NoSuchResource('user');
    return user;
  } catch (err) {
    throw new NoSuchResource('user');
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
    data: from,
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
  from.password = await auth.hash(from.password);
  try {
    const user = await ctx.prisma.user.update({
      where: { id: userId },
      data: from,
      select: publicFields,
    });
    return user;
  } catch (err) {
    log.error(err);
    throw new NoSuchResource('user');
  }
};

const updatePassword = async (userId: number, password: string, ctx: PrismaContext) => {
  try {
    const user = await ctx.prisma.user.update({
      where: { id: userId },
      data: { password },
      select: publicFields,
    });
    return user;
  } catch (err) {
    throw new NoSuchResource('user');
  }
};

const updateAvatar = async (
  userId: number,
  oldAvatar: string,
  newAvatar: string,
  ctx: PrismaContext
) => {
  try {
    const user = await ctx.prisma.user.update({
      where: { id: userId },
      data: { profile_img: newAvatar },
      select: publicFields,
    });
    if (oldAvatar !== newAvatar) {
      await img.remove(oldAvatar);
    }
    return user;
  } catch (err) {
    throw new BadRequest('');
  }
};

export default {
  all,
  remove,
  create,
  select,
  update,
  selectByEmailSecret,
  updatePassword,
  updateAvatar,
};
