import { User } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { AbstractClient } from './AbstractClient';
import { Ideas } from './Database';

export class IdeasClient extends AbstractClient {
  public readonly TAG = 'idea';
  public readonly publicFields = {
    id: true,
    created_at: true,
    comments: {
      select: {
        content: true,
        user: { select: { id: true, name: true } },
        id: true,
        created_at: true,
      },
    },
    user: { select: { id: true, name: true } },
    content: true,
    likes: {
      select: {
        user_id: true,
      },
    },
    title: true,
    tags: {
      select: {
        tag: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    },
  };

  /**
   * Select all ideas.
   *
   * @param page the page number for pagination
   * @param tags the tag ids
   * @returns Array of all ideas.
   */
  async all(page: number, tags: number[], sort: string|undefined, method: string = 'desc') {
    const resultsPerPage = 20;

    // construct query out of parts
    // have to use the any-type here to keep TS from freaking out when we change the object
    let query: any = {
      select: this.publicFields,
      skip: page * resultsPerPage,
      take: resultsPerPage,
    };

    query = this.setOrderBy(query, method, sort);
    if (tags.length > 0) {
      query = {
        ...query,
        where: { tags: { some: { tag_id: { in: tags } },},
        },
      };
    }
    return await this.ctx.prisma.idea.findMany(query);
  }

  /**
   * Select single idea.
   *
   * @param id idea id.
   * @throws Error on not found.
   * @returns Idea {@link RichIdea}
   */
  async select(id: number) {
    try {
      const result = await this.ctx.prisma.idea.findFirstOrThrow({
        where: { id },
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource('idea', `No idea with id: ${id}`);
    }
  }

  /**
   * Removes specified idea.
   *
   * @param id idea id.
   * @throws Error on not idea found.
   * @returns removed idea object.
   */
  async remove(id: number, user: User) {
    log.info(`id ${id} user.id ${user.id}`);
    try {
      const ideaDeleteResult = await this.ctx.prisma.idea.delete({
        where: { id },
        select: this.publicFields,
      });
      if (ideaDeleteResult === null) throw new NoSuchResource('idea');
      return ideaDeleteResult;
    } catch (err) {
      log.debug(JSON.stringify(err));
      throw new NoSuchResource('idea', `No idea with id: ${id}`);
    }
  }

  /**
   * Tries to creates idea from specified prototype object.
   *
   * @param from New idea prototype
   * @param user User object
   * @throws Error when one of the tag ids doesn't match with the existing tag ids
   * @returns Promise<Idea> Created idea object.
   */
  async create(from: Ideas.Create, user: User) {
    try {
      const tags = from.tags.map((x) => ({ tag: { connect: { id: Number(x) } } }));
      log.info(`tags ${JSON.stringify(tags)}`);
      // Create idea and store it to database.
      const idea = await this.ctx.prisma.idea.create({
        data: {
          title: from.title,
          content: from.content,
          user: {
            connect: { id: user.id },
          },
          tags: {
            create: tags,
          },
        },
        select: this.publicFields,
      });
      log.info('Created new idea: ' + JSON.stringify(idea));
      return idea;
    } catch (err) {
      throw new BadRequest('No tag exists with that id, cant create idea.');
    }
  }

  /**
   * Tries to update the idea with the given data
   *
   * @param from updated idea data
   * @param id
   * @throws Error when one of the tag ids does not match with any existing tag ids
   * @returns Promise<Idea> Updated Idea object.
   */
  async update(from: Ideas.Update, id: number) {
    log.info(`from ${JSON.stringify(from)}`);
    if (from.tags === undefined) {
      throw new BadRequest('Tags not sent');
    }

    log.info(`db tags: ${await this.ctx.prisma.tag.findMany()}`);
    // check that all the tags exist
    const tags = await this.ctx.prisma.tag.findMany({
      where: {
        id: { in: from.tags },
      },
    });
    log.info(`tags ${JSON.stringify(tags)}`);
    log.info(`from.tags ${JSON.stringify(from.tags)}, ids ${from.tags.map(Number)}`);
    if (!tags || tags.length !== from.tags.length) {
      throw new BadRequest(`One or more of the tags do not exist, cannot update idea`);
    }

    try {
      const tagsConnection = from.tags
        ? from.tags.map((x) => ({ tag: { connect: { id: Number(x) } } }))
        : [];

      // due to how Prisma works, we have to clear out the old m2m connections first
      await this.ctx.prisma.idea.update({
        where: { id },
        data: {
          tags: {
            deleteMany: {},
          },
        },
      });
      log.info(`tags ${from.tags}`);
      // now we can add the new ones when updating
      log.info(`tagsConnection ${JSON.stringify(tagsConnection)}`);
      const idea = await this.ctx.prisma.idea.update({
        where: { id },
        data: {
          title: from.title,
          content: from.content,
          tags: {
            create: tagsConnection,
          },
        },
        select: this.publicFields,
      });
      return idea;
    } catch (err) {
      throw new BadRequest('Idea does not exist, cannot update');
    }
  }

  async userOwns(user: User, ideaId: number) {
    try {
      const result = await this.ctx.prisma.idea.findFirst({
        where: { id: ideaId },
      });
      if (result) {
        return result.user_id === user.id;
      } else {
        throw new NoSuchResource(this.TAG, `No idea with id: ${ideaId}`);
      }
    } catch (err) {
      throw err;
    }
  }

  private setOrderBy(query: any, method: string, sort: string|undefined) {
    // Make sure sort method is correct
    if (method !== 'asc') method = 'desc'

    // Set orderBy field and method.
    if (sort === 'comments')
     return {...query, orderBy: {comments: {_count: method}}}
    else if (sort === 'likes')
      return {...query, orderBy: {likes: {_count: method}}}
    else if (sort === 'date')
      return {...query, orderBy: {created_at: method}}
    else return query
  }
}
