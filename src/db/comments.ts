import { Comment, User } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface CommentFields {
  content: string;
  idea_id: number;
  user_id: number;
}

export interface CommentUpdateFields {
  content: string;
}

export const publicFields = {
  content: true,
  user: { select: { id: true, name: true } },
  id: true,
  idea: { select: { id: true, user_id: true } },
  created_at: true,
};

/**
 * Get all Comments.
 *
 * @param ctx Prisma database context
 * @returns Array of {@link Comment}s
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.comment.findMany();
};

/**
 * Get single Comment.
 *
 * @param commentId Id of the Comment
 * @param ctx Prisma database context
 * @throws on missing Comment {@link NoSuchResource} error.
 * @returns Comment
 */
const select = async (commentId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.comment.findFirstOrThrow({
      where: { id: commentId },
      select: publicFields,
    });
  } catch (err) {
    throw new NoSuchResource('comment', `No comment with id: ${commentId}`);
  }
};

/**
 * Create new Comment and store it to database.
 *
 * @param from object to build new Comment from.
 * @param ctx Prisma database context
 * @returns Created Comment object
 */
const create = async (from: CommentFields, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.comment.create({
      data: from,
      select: publicFields,
    });
    log.info('Created new like: ' + JSON.stringify(result));
    return result;
  } catch (err) {
    throw new BadRequest('Unable to comment this idea');
  }
};

/**
 * Removes specified user and returns that object.
 *
 * @param commentId Id of the comment
 * @param ctx Prisma database context
 * @returns deleted Comment object
 */
const remove = async (commentId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.comment.delete({
      where: { id: commentId },
      select: publicFields,
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('comment', `No comment with id: ${commentId}`);
  }
};

/**
 *
 * @param commentId
 * @param from
 * @param ctx
 * @returns
 */
const update = async (
  commentId: number,
  from: CommentUpdateFields,
  ctx: PrismaContext
) => {
  try {
    const result = await ctx.prisma.comment.update({
      where: { id: commentId },
      data: from,
      select: publicFields,
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('comment', `No comment with id: ${commentId}`);
  }
};

/**
 *
 * @param commentId Id of the Comment
 * @param user
 * @param ctx
 * @returns
 */
const userOwned = async (user: User, commentId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.comment.findFirst({
      where: { id: commentId },
    });
    if (result) {
      return result.user_id === user.id;
    } else {
      throw new NoSuchResource('comment', `No comment with id: ${commentId}`);
    }
  } catch (err: any) {
    throw err;
  }
};

export default {
  all,
  create,
  select,
  remove,
  update,
  userOwned,
};
