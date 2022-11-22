import { Role, User, Like } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface LikeFields {
  idea_id: number;
  user_id: number;
}

export type RoleWithUsers = Role & { users: User[] };
export const publicFields = {
  user: { select: { id: true, name:true } },
  id: true,
  idea: {select: {id:true, user_id:true}},
  created_at: true,
};

/**
 * Get all likes.
 *
 * @param ctx Prisma database context
 * @returns Array of {@link Like}s
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.like.findMany();
};

/**
 * Get single like.
 *
 * @param likeId Id of the like
 * @param ctx Prisma database context
 * @throws on missing like {@link NoSuchResource} error.
 * @returns Like
 */
const select = async (likeId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.like.findFirstOrThrow({
      where: { id: likeId },
      select: publicFields,
    });
  } catch (err) {
    throw new NoSuchResource('like', `No like with id: ${likeId}`);
  }
};

/**
 * Create new Like and store it to database.
 *
 * @param from object to build new Like from.
 * @param ctx Prisma database context
 * @returns Created Like
 */
const create = async (from: LikeFields, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.like.create({
      data: from,
      select: publicFields,
    });
    log.info('Created new like: ' + JSON.stringify(result));
    return result;
  } catch (err) {
    throw new BadRequest('Unable to like this idea');
  }
};

/**
 * Removes specified user and returns that object.
 * 
 * @param likeId Id of the like
 * @param ctx Prisma database context
 * @returns deleted Like object
 */
const remove = async (likeId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.like.delete({
      where: { id: likeId },
      select: publicFields,
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('like', `No like with id: ${likeId}`);
  }
};

const userOwnsLike = async (userId: number, likeId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.like.findFirst({
      where: {id: likeId, AND: {user: {id: userId}}}
    })
    return (result !== null) 
  } catch (err: any) {
    throw new err;
  }
}

export default {
  all,
  create,
  select,
  remove,
  userOwnsLike
};
