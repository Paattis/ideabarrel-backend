import { Comment, Idea, Prisma, Role, User, Group } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';
import {Unauthorized} from '../utils/errors';

export interface IdeaData {
  content: string;
  //user: User;
  groups: number[];
}
export type IdeaWithGroups = Idea & { groups: Group[] };
export type RichIdea = IdeaWithGroups & { comments: Comment[] };
const everything = { groups: true, comments: true };

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
  const idea: Idea = await ctx.prisma.idea.findFirstOrThrow({where: {id: idea_id, user_id: user.id } })
  log.info(`idea id ${idea_id} ${idea}`)
  if (!idea) throw new Unauthorized()
  return true
}

/**
 * Select all ideas.
 *
 * @param ctx PrismaContext
 * @param page the page number for pagination
 * @param groups the group ids
 * @returns Array of all ideas.
 */
const all = async (ctx: PrismaContext, page: number, user: User, groups?: number[]) => {
  const resultsPerPage = 20;
  // TODO: support for tags

  // construct query out of parts
  // have to use the any-type here to keep TS from freaking out when we change the object
  let query: any = {
    include: everything,
    skip: page * resultsPerPage,
    take: resultsPerPage,
  };

  if (groups) {
    query = {
      ...query,
      where: {
        groups: {
          some: {
            group_id: { in: groups },
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
    await checkRights(ctx,user, id)

    // delete m2m relationship between Group(s) and the Idea
    const m2mDeleteResult: Idea = await ctx.prisma.idea.update({
      where: { id: id },
      data: {
        groups: {
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
 * @throws Error when one of the group ids doesn't match with the existing group ids
 * @returns Promise<Idea> Created idea object.
 */
const create = async (from: IdeaData, user: User, ctx: PrismaContext) => {
  try {
    const groups = from.groups.map((x) => ({ group: { connect: { id: Number(x) } } }));
    log.info(`groups ${JSON.stringify(groups)}`)
    // Create idea and store it to database.
    const idea = await ctx.prisma.idea.create({
      data: {
        content: from.content,
        user: {
          connect: { id: user.id }, 
        },
        groups: {
          create: groups,
        },
      },
      include: everything,
    });
    log.info('Created new idea: ' + JSON.stringify(idea));
    return idea;

    return idea;
  } catch (err) {
    throw new BadRequest('No group exists with that id, cant create idea.');
  }
};

/**
 * Tries to update the idea with the given data
 *
 * @param from updated idea data
 * @param id
 * @param ctx prisma context
 * @throws Error when one of the group ids does not match with any existing group ids
 * @returns Promise<Idea> Updated Idea object.
 */
const update = async (from: IdeaData, id: number, user: User, ctx: PrismaContext) => {
  log.info(`from ${JSON.stringify(from)}`)
  await checkRights(ctx,user, id)
  if (from.groups == undefined) {
    throw new BadRequest('Groups not sent')
  }


  log.info(`db groups: ${
    await ctx.prisma.group.findMany()
  }`)
  // check that all the groups exist
    const groups = await ctx.prisma.group.findMany({
      where: {
        id: { in: from.groups },
      },
    });
    log.info(`groups ${JSON.stringify(groups)}`)
    log.info(`from.groups ${JSON.stringify(from.groups)}, ids ${from.groups.map(Number)}`)
    if (!groups || (groups.length != from.groups.length)) {
      throw new BadRequest(
        `One or more of the groups do not exist, cannot update idea`
      );
    }

  try {
    const groupsConnection = from.groups
      ? from.groups.map((x) => ({ group: { connect: { id: Number(x) } } }))
      : [];

    // due to how Prisma works, we have to clear out the old m2m connections first
    const m2mDeleteResult: Idea = await ctx.prisma.idea.update({
      where: { id: id },
      data: {
        groups: {
          deleteMany: {},
        },
      },
    });
    log.info(`groups ${from.groups}`)
    // now we can add the new ones when updating
    log.info(`groupsConnection ${JSON.stringify(groupsConnection)}`);
    const idea = await ctx.prisma.idea.update({
      where: { id: id },
      data: {
        content: from.content,
        groups: {
          create: groupsConnection,
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
