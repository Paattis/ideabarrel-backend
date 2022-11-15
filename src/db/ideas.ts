import { Comment, Idea, Prisma, Role, User, Group } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { PrismaContext } from './context';

export interface IdeaData {
  name: string;
  content: string;
  user: User,
  groups: number[];
}
export type IdeaWithGroups = Idea & { groups: Group[] };
export type RichIdea = IdeaWithGroups & { comments: Comment[] };
const everything = { groups: true, comments: true };

/**
 * Select all ideas.
 *
 * @param ctx PrismaContext
 * @returns Array of all ideas.
 */
const all = async (ctx: PrismaContext, page: number) => {
  const resultsPerPage = 20
  return await ctx.prisma.idea.findMany({ include: everything, skip: page*resultsPerPage, take: resultsPerPage });
};

/**
 * Select single idea.
 *
 * @param id idea id.
 * @param ctx PrismaContext
 * @throws Error on not found.
 * @returns Idea {@link RichIdea}
 */
const select = async (id: number, ctx: PrismaContext) => {
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
const remove = async (id: number, ctx: PrismaContext) => {
  log.info(`id ${id}`)
  try {
    // delete m2m relationship between Group(s) and the Idea
    const m2mDeleteResult: Idea = await ctx.prisma.idea.update({
      where: {id: id},
      data: {
        groups: {
          deleteMany: {}
        }
      }
    });

    const idea: Idea = await ctx.prisma.idea.delete({
      where: { id: id },
      include: everything,
    });
    if (idea === null) throw 'Missing record';
    return idea;
  } catch (err) {
    throw new NoSuchResource('idea', `No idea with id: ${id}`);
  }
};

/**
 * Tries to creates idea from specified prototype object.
 *
 * @param from New idea prototype
 * @param ctx prisma context
 * @throws Error when one of the group ids doesn't match with the existing group ids
 * @returns Promise<Idea> Created idea object.
 */
const create = async (from: IdeaData, ctx: PrismaContext) => {
  try {

    const groups = from.groups.map(x => ({group: {connect: {id: Number(x)}}}))

    // Create idea and store it to database.
    const idea = await ctx.prisma.idea.create({
      data: {
        content: from.content,
        user: {
          connect: {id: 3} // TODO: add actual user id when auth feature is finished
        },
        groups: {
          create: groups,
        },
      },
      include: everything
    });
    return idea

    log.info('Created new idea: ' + JSON.stringify(idea));
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
const update = async (from: IdeaData, id: number, ctx: PrismaContext) => {

  if(from.groups) {
    try {
      // check that all the groups exist
      const groups = await ctx.prisma.group.findMany({
        where: {
          id: {in: from.groups.map(Number)}
        }
      })

      if(groups.length != from.groups.length) {
        throw new BadRequest(`One or more of the groups do not exist, cannot update idea`)
      }

    } catch (err) {
      throw err
      throw new BadRequest(
        'Unknown error, cannot update Idea'
      );
    }
  }

  try {
    const groupsConnection = from.groups ? from.groups.map(x => ({group: {connect: {id: Number(x)}}})) : []

    // due to how Prisma works, we have to clear out the old m2m connections first
    const m2mDeleteResult: Idea = await ctx.prisma.idea.update({
      where: {id: id},
      data: {
        groups: {
          deleteMany: {}
        }
      }
    });


    // now we can add the new ones when updating
    log.info(`groupsConnection ${JSON.stringify(groupsConnection)}`)
    const idea = await ctx.prisma.idea.update({
      where: {id: id},
      data: {
        content: from.content,
        groups: {
          create: groupsConnection
        }
      },
      include: everything
    })
    return idea
  } catch (err) {
    throw new BadRequest(
      'Idea does not exist, cannot update'
    );
  }
};

export default { all, select, create, remove, update };

