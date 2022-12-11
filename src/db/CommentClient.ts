import { log } from '../logger/log';
import { BadRequest, NoSuchResource } from '../utils/errors';
import { AbstractClient } from './AbstractClient';
import { Comments } from './Database';
import { PublicUser } from './UserClient';

export class CommentsClient extends AbstractClient {
  public readonly TAG = 'comment';
  public readonly publicFields = {
    content: true,
    user: { select: { id: true, name: true } },
    id: true,
    idea: { select: { id: true, user_id: true } },
    created_at: true,
  };

  /**
   * Get all Comments.
   * @returns Array of {@link Comment}s
   */
  async all() {
    return await this.ctx.prisma.comment.findMany({ select: this.publicFields });
  }

  /**
   * Get single Comment.
   *
   * @param commentId Id of the Comment
   * @throws on missing Comment {@link NoSuchResource} error.
   * @returns Comment
   */
  async select(commentId: number) {
    try {
      return await this.ctx.prisma.comment.findFirstOrThrow({
        where: { id: commentId },
        select: this.publicFields,
      });
    } catch (err) {
      throw new NoSuchResource(this.TAG, `No comment with id: ${commentId}`);
    }
  }

  /**
   * Create new Comment and store it to database.
   *
   * @param from object to build new Comment from.
   * @returns Created Comment object
   */
  async create(from: Comments.Create) {
    try {
      const result = await this.ctx.prisma.comment.create({
        data: from,
        select: this.publicFields,
      });
      log.info('Created new like: ' + JSON.stringify(result));
      return result;
    } catch (err) {
      throw new BadRequest('Unable to comment this idea');
    }
  }

  /**
   * Removes specified user and returns that object.
   *
   * @param commentId Id of the comment
   * @returns deleted Comment object
   */
  async remove(commentId: number) {
    try {
      const result = await this.ctx.prisma.comment.delete({
        where: { id: commentId },
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource(this.TAG, `No comment with id: ${commentId}`);
    }
  }

  /**
   * Update comment fields.
   *
   * @param commentId Id of the comment.
   * @param from Update field object.
   * @returns Updated comment object.
   */
  async update(commentId: number, from: Comments.Update) {
    try {
      const result = await this.ctx.prisma.comment.update({
        where: { id: commentId },
        data: from,
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource(this.TAG, `No comment with id: ${commentId}`);
    }
  }

  /**
   * Check if user owns comment with specified id.
   *
   * @param commentId Id of the Comment
   * @param user User who we are checking
   * @returns True, if comment belongs to specified user.
   */
  async userOwns(user: PublicUser, commentId: number) {
    try {
      const result = await this.ctx.prisma.comment.findFirst({
        where: { id: commentId },
      });
      if (result) {
        return result.user_id === user.id;
      } else {
        throw new NoSuchResource(this.TAG, `No comment with id: ${commentId}`);
      }
    } catch (err: any) {
      throw err;
    }
  }
}
