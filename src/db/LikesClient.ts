import { Like, User } from '@prisma/client';
import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { AbstractClient } from './AbstractClient';
import { Likes } from './Database';

export class LikesClient extends AbstractClient {
  public readonly TAG = 'like';
  public readonly publicFields = {
    user: { select: { id: true, name: true } },
    id: true,
    idea: { select: { id: true, user_id: true } },
    created_at: true,
  };

  /**
   * Get all likes.
   *
   * @returns Array of {@link Like}s
   */
  async all() {
    return await this.ctx.prisma.like.findMany({ select: this.publicFields });
  }

  /**
   * Get single like.
   *
   * @param likeId Id of the like
   * @throws on missing like {@link NoSuchResource} error.
   * @returns Like
   */
  async select(likeId: number) {
    try {
      return await this.ctx.prisma.like.findFirstOrThrow({
        where: { id: likeId },
        select: this.publicFields,
      });
    } catch (err) {
      throw new NoSuchResource('like', `No like with id: ${likeId}`);
    }
  }

  /**
   * Create new Like and store it to database.
   *
   * @param from object to build new Like from.
   * @returns Created Like
   */
  async create(from: Likes.Create) {
    try {
      const result = await this.ctx.prisma.like.create({
        data: from,
        select: this.publicFields,
      });
      log.info('Created new like: ' + JSON.stringify(result));
      return result;
    } catch (err) {
      throw new BadRequest('Unable to like this idea');
    }
  }

  /**
   * Removes specified user and returns that object.
   *
   * @param likeId Id of the like
   * @returns deleted Like object
   */
  async remove(likeId: number) {
    try {
      const result = await this.ctx.prisma.like.delete({
        where: { id: likeId },
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource('like', `No like with id: ${likeId}`);
    }
  }

  /**
   * Removes specified user and returns that object.
   *
   * @param ideaId Id of the idea
   * @param userId Id of the user
   * @returns deleted Like object
   */
  async removeFromIdea(ideaId: number, userId: number) {
    try {
      const result = await this.ctx.prisma.like.delete({
        where: { likeIdentifier: { idea_id: ideaId, user_id: userId } },
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new BadRequest('Unable to dislike this idea');
    }
  }

  /**
   * Removes specified user and returns that object.
   *
   * @param ideaId Id of the idea
   * @param userId Id of the user
   * @returns deleted Like object
   */
  async createForIdea(ideaId: number, userId: number) {
    try {
      const result = await this.ctx.prisma.like.create({
        data: { user_id: userId, idea_id: ideaId },
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new BadRequest('Unable to like this idea');
    }
  }

  /**
   * Check if user owns specified like.
   *
   * @param user User in question
   * @param likeId Target like
   * @returns true if user owns the like.
   */
  async userOwns(user: User, likeId: number) {
    try {
      const result = await this.ctx.prisma.like.findFirst({
        where: { id: likeId },
      });
      if (result) {
        return result.user_id === user.id;
      } else {
        throw new NoSuchResource('like', `No like with id: ${likeId}`);
      }
    } catch (err: any) {
      throw err;
    }
  }
}
