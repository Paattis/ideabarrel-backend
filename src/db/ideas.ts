import { Comment, Idea, Prisma, Role, User, Tag } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';
import { Unauthorized } from '../utils/errors';

export interface IdeaData {
  content: string;
  //user: User;
  tags: number[];
}
export type IdeaWithTags = Idea & { tags: Tag[] };
export type RichIdea = IdeaWithTags & { comments: Comment[] };
const everything = { tags: true, comments: true };

/**
 * Checks if the idea with the idea id is a valid idea the user can access
 * @param user the user to check against
 * @param idea_id the id of the idea to check
 * @returns true if the access rights are valid
 * @throws Unauthorized
 */
const checkRights = async (ctx: PrismaContext, user: User, idea_id: number) => {
  // TODO: add admin check
  // TODO: make into middleware
  const idea: Idea = await ctx.prisma.idea.findFirstOrThrow({
    where: { id: idea_id, user_id: user.id },
  });
  log.info(`idea id ${idea_id} ${idea}`);
  if (!idea) throw new Unauthorized();
  return true;
};

/**
 * Select all ideas.
 *
 * @param ctx PrismaContext
 * @param page the page number for pagination
 * @param tags the tag ids
 * @returns Array of all ideas.
 */
const all = async (ctx: PrismaContext, page: number, user: User, tags?: number[]) => {
  const resultsPerPage = 20;
  // TODO: support for tags

  // construct query out of parts
  // have to use the any-type here to keep TS from freaking out when we change the object
  let query: any = {
    include: everything,
    skip: page * resultsPerPage,
    take: resultsPerPage,
  };

  if (tags) {
    query = {
      ...query,
      where: {
        tags: {
          some: {
            tag_id: { in: tags },
          },
        },
      },
    };
  }

  return await ctx.prisma.idea.findMany(query);
};

/**
 * Select single idea.
 *
 * @param id idea id.
 * @param ctx PrismaContext
 * @throws Error on not found.
 * @returns Idea {@link RichIdea}
 */
const select = async (id: number, user: User, ctx: PrismaContext) => {
  try {
    return await ctx.prisma.idea.findFirstOrThrow({
      where: { id: id },
      include: everything,
    });
  } catch (err) {
    throw new NoSuchResource('idea', `No idea with id: ${id}`);
  }
};

/**
 * Removes specified idea.
 *
 * @param id idea id.
 * @param ctx PrismaContext
 * @throws Error on not idea found.
 * @returns removed idea object.
 */
const remove = async (id: number, user: User, ctx: PrismaContext) => {
  log.info(`id ${id} user.id ${user.id}`);
  try {
    await checkRights(ctx, user, id);

    // delete m2m relationship between Tag(s) and the Idea
    const m2mDeleteResult: Idea = await ctx.prisma.idea.update({
      where: { id: id },
      data: {
        tags: {
          deleteMany: {},
        },
      },
    });

    const ideaDeleteResult: Idea = await ctx.prisma.idea.delete({
      where: {
        id: id,
      },
      include: everything,
    });
    if (ideaDeleteResult === null) throw 'Missing record';
    return ideaDeleteResult;
  } catch (err) {
    throw new NoSuchResource('idea', `No idea with id: ${id}`);
  }
};

/**
 * Tries to creates idea from specified prototype object.
 *
 * @param from New idea prototype
 * @param user_id the id of the currently logged in user
 * @param ctx prisma context
 * @throws Error when one of the tag ids doesn't match with the existing tag ids
 * @returns Promise<Idea> Created idea object.
 */
const create = async (from: IdeaData, user: User, ctx: PrismaContext) => {
  try {
    const tags = from.tags.map((x) => ({ tag: { connect: { id: Number(x) } } }));
    log.info(`tags ${JSON.stringify(tags)}`);
    // Create idea and store it to database.
    const idea = await ctx.prisma.idea.create({
      data: {
        content: from.content,
        user: {
          connect: { id: user.id },
        },
        tags: {
          create: tags,
        },
      },
      include: everything,
    });
    log.info('Created new idea: ' + JSON.stringify(idea));
    return idea;

    return idea;
  } catch (err) {
    throw new BadRequest('No tag exists with that id, cant create idea.');
  }
};

/**
 * Tries to update the idea with the given data
 *
 * @param from updated idea data
 * @param id
 * @param ctx prisma context
 * @throws Error when one of the tag ids does not match with any existing tag ids
 * @returns Promise<Idea> Updated Idea object.
 */
const update = async (from: IdeaData, id: number, user: User, ctx: PrismaContext) => {
  log.info(`from ${JSON.stringify(from)}`);
  await checkRights(ctx, user, id);
  if (from.tags == undefined) {
    throw new BadRequest('Tags not sent');
  }

  log.info(`db tags: ${await ctx.prisma.tag.findMany()}`);
  // check that all the tags exist
  const tags = await ctx.prisma.tag.findMany({
    where: {
      id: { in: from.tags },
    },
  });
  log.info(`tags ${JSON.stringify(tags)}`);
  log.info(`from.tags ${JSON.stringify(from.tags)}, ids ${from.tags.map(Number)}`);
  if (!tags || tags.length != from.tags.length) {
    throw new BadRequest(`One or more of the tags do not exist, cannot update idea`);
  }

  try {
    const tagsConnection = from.tags
      ? from.tags.map((x) => ({ tag: { connect: { id: Number(x) } } }))
      : [];

    // due to how Prisma works, we have to clear out the old m2m connections first
    const m2mDeleteResult: Idea = await ctx.prisma.idea.update({
      where: { id: id },
      data: {
        tags: {
          deleteMany: {},
        },
      },
    });
    log.info(`tags ${from.tags}`);
    // now we can add the new ones when updating
    log.info(`tagsConnection ${JSON.stringify(tagsConnection)}`);
    const idea = await ctx.prisma.idea.update({
      where: { id: id },
      data: {
        content: from.content,
        tags: {
          create: tagsConnection,
        },
      },
      include: everything,
    });
    return idea;
  } catch (err) {
    throw new BadRequest('Idea does not exist, cannot update');
  }
};

export default { all, select, create, remove, update };
