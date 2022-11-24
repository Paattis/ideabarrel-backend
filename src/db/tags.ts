import { Tag, Prisma } from '@prisma/client';
import { log } from '../logger/log';
import { NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface TagFields {
  name: string;
  description: string;
}

// const publicFields = {
//   id: true,
//   name: true,
//   description: true,
//   users: { select: { name: true, id: true } },
// };

/**
 * Get all Tags.
 *
 * @param ctx Prisma database context
 * @returns Array of {@link Tag}s
 */
const all = async (ctx: PrismaContext) => {
  return await ctx.prisma.tag.findMany();
};

/**
 * Get all Tags, each enriched with users linked
 * liked to them.
 *
 * @param ctx Prisma database context
 * @returns Array of {@link TagWithUsers}'
 */
const allTagsWithUsers = async (ctx: PrismaContext) => {
  return await ctx.prisma.tag.findMany();
};

/**
 * Get single Tag with users linked to it.
 *
 * @param TagId id of the Tag
 * @param ctx Prisma database context
 * @throws on missing Tag {@link NoSuchResource} error.
 * @returns Tag as {@link TagWithUsers}
 */
const selectWithUsers = async (TagId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.tag.findFirstOrThrow({
      where: { id: TagId },
      // select: publicFields,
    });
  } catch (err) {
    throw new NoSuchResource('tag');
  }
};

/**
 * Get single Tag.
 *
 * @param TagId Id of the Tag
 * @param ctx Prisma database context
 * @throws on missing Tag {@link NoSuchResource} error.
 * @returns Tag
 */
const select = async (TagId: number, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.tag.findFirstOrThrow({ where: { id: TagId } });
  } catch (err) {
    throw new NoSuchResource('tag');
  }
};

/**
 * Create new Tag and store it to database.
 *
 * @param from object to build new Tag from.
 * @param ctx Prisma database context
 * @returns Created Tag
 */
const create = async (from: TagFields, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.tag.create({
      data: {
        name: from.name,
        description: from.description ?? '',
      },
    });
    log.info('Created new Tag: ' + JSON.stringify(result));
    return result;
  } catch (err) {
    throw err;
  }
};

/**
 * Add a user to a tag
 * @param tagId the tag to which to add the user to
 * @param userId the user who is added to the tag
 * @returns the updated tag
 */
const addUserToTag = async (tagId: number, userId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.tag.update({
      where: { id: tagId },
      data: {
        users: {
          create: [{ user: { connect: { id: userId } } }],
        },
      },
      include: { users: true },
    });

    return result;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      // just return since this error signifies that the relation already
      // exists and checking this with a query is distractingly difficult
      return {};
    }
  }
};

/**
 * Add a user to a tag
 * @param tagId the tag to which to add the user to
 * @param userId the user who is removed from the tag
 * @returns the updated tag
 */
const removeUserFromTag = async (tagId: number, userId: number, ctx: PrismaContext) => {
  try {
    await ctx.prisma.tagUser.delete({
      where: {
        user_id_tag_id: {
          user_id: userId,
          tag_id: tagId,
        },
      },
    });
  } catch (err) {
    throw new Error('Something went wrong');
  }
};

const remove = async (TagId: number, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.tag.delete({
      where: { id: TagId },
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('tag', `No Tag with id: ${TagId}`);
  }
};

const update = async (TagId: number, tag: TagFields, ctx: PrismaContext) => {
  try {
    const result = await ctx.prisma.tag.update({
      where: { id: TagId },
      data: tag,
    });
    return result;
  } catch (err) {
    throw new NoSuchResource('tag', `No Tag with id: ${TagId}`);
  }
};

const tagIsFree = async (name: string, ctx: PrismaContext) => {
  try {
    await ctx.prisma.tag.findFirstOrThrow({ where: { name } });
    return false;
  } catch (error) {
    return true;
  }
};

export default {
  all,
  create,
  select,
  update,
  allTagsWithUsers,
  selectWithUsers,
  remove,
  addUserToTag,
  removeUserFromTag,
  tagIsFree,
};
