import { Prisma } from '@prisma/client';
import { log } from '../logger/log';
import { NoSuchResource } from '../utils/errors';
import { AbstractClient } from './AbstractClient';
import { Tags } from './Database';

export class TagsClient extends AbstractClient {
  public readonly TAG = 'tag';
  public readonly publicFields = {
    id: true,
    name: true,
    description: true,
    users: { select: { name: true, id: true } },
  };

  /**
   * Get all Tags.
   *
   * @returns Array of {@link Tag}s
   */
  async all() {
    return await this.ctx.prisma.tag.findMany();
  }

  /**
   * Get all Tags, each enriched with users linked
   * liked to them.
   *
   * @returns Array of {@link TagWithUsers}'
   */
  async allTagsWithUsers() {
    return await this.ctx.prisma.tag.findMany();
  }

  /**
   * Get single Tag with users linked to it.
   *
   * @param TagId id of the Tag
   * @throws on missing Tag {@link NoSuchResource} error.
   * @returns Tag as {@link TagWithUsers}
   */
  async selectWithUsers(TagId: number) {
    try {
      return await this.ctx.prisma.tag.findFirstOrThrow({
        where: { id: TagId },
        // select: publicFields,
      });
    } catch (err) {
      throw new NoSuchResource(this.TAG);
    }
  }

  /**
   * Get single Tag.
   *
   * @param tagId Id of the Tag
   * @throws on missing Tag {@link NoSuchResource} error.
   * @returns Tag
   */
  async select(tagId: number) {
    try {
      return await this.ctx.prisma.tag.findFirstOrThrow({ where: { id: tagId } });
    } catch (err) {
      throw new NoSuchResource(this.TAG);
    }
  }

  /**
   * Create new Tag and store it to database.
   *
   * @param from object to build new Tag from.
   * @returns Created Tag
   */
  async create(from: Tags.Create) {
    try {
      const result = await this.ctx.prisma.tag.create({
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
  }

  /**
   * Add a user to a tag
   * @param tagId the tag to which to add the user to
   * @param userId the user who is added to the tag
   * @returns the updated tag
   */
  async addUserToTag(tagId: number, userId: number) {
    try {
      const result = await this.ctx.prisma.tag.update({
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
  }

  /**
   * Add a user to a tag
   * @param tagId the tag to which to add the user to
   * @param userId the user who is removed from the tag
   * @returns the updated tag
   */
  async removeUserFromTag(tagId: number, userId: number) {
    try {
      await this.ctx.prisma.tagUser.delete({
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
  }

  async remove(TagId: number) {
    try {
      const result = await this.ctx.prisma.tag.delete({
        where: { id: TagId },
      });
      return result;
    } catch (err) {
      throw new NoSuchResource(this.TAG, `No Tag with id: ${TagId}`);
    }
  }

  async update(TagId: number, from: Tags.Update) {
    try {
      const result = await this.ctx.prisma.tag.update({
        where: { id: TagId },
        data: from,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource(this.TAG, `No Tag with id: ${TagId}`);
    }
  }

  async tagIsFree(name: string) {
    try {
      await this.ctx.prisma.tag.findFirstOrThrow({ where: { name } });
      return false;
    } catch (error) {
      return true;
    }
  }
}
