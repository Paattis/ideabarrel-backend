import { Idea, Role, User } from '@prisma/client';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { BadRequest, NoSuchResource } from '../utils/errors';
import img from '../utils/img';
import { AbstractClient } from './AbstractClient';
import { Users } from './Database';

export type PublicUser = {
  comments: Comment[];
  name: string;
  profile_img: string;
  email: string;
  role: Role;
  id: number;
  created_at: string;
  ideas: Idea[];
};

export class UserClient extends AbstractClient {
  public readonly TAG = 'user';
  public readonly publicFields = {
    comments: { select: { content: true, id: true, created_at: true, idea: true } },
    name: true,
    profile_img: true,
    email: true,
    id: true,
    role: { select: { name: true, id: true } },
    created_at: true,
    ideas: true,
    likes: true,
  };

  /**
   * Selects all users.
   *
   * @returns Array of {@link PublicUser}s
   */
  async all() {
    return await this.ctx.prisma.user.findMany({ select: this.publicFields });
  }

  /**
   * Select single user.
   *
   * @param userId user id.
   * @throws on no user found {@link NoSuchResource}
   * @returns User as a {@link PublicUser}
   */
  async select(userId: number) {
    try {
      const result = await this.ctx.prisma.user.findFirst({
        where: { id: userId },
        select: this.publicFields,
      });
      if (!result) throw new NoSuchResource(this.TAG);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async selectByEmailSecret(email: string) {
    return await this.ctx.prisma.user.findFirst({
      where: { email },
      select: { ...this.publicFields, password: true },
    });
  }

  /**
   * Removes specified user and returns that object.
   *
   * @param userId user id.
   * @throws on no user found {@link NoSuchResource}
   * @returns removed user as a {@link PublicUser}
   */
  async remove(userId: number) {
    try {
      const user = await this.ctx.prisma.user.delete({
        where: { id: userId },
        select: this.publicFields,
      });
      if (user === null) throw new NoSuchResource(this.TAG);
      return user;
    } catch (err) {
      throw new NoSuchResource(this.TAG);
    }
  }

  /**
   * Tries to creates user from specified prototype object.
   *
   * @param from New user prototype
   * @throws on broken relations {@link BadRequest}
   * @returns New User as a {@link PublicUser}
   */
  async create(from: Users.Create) {
    const user = await this.ctx.prisma.user.create({
      data: from,
      select: this.publicFields,
    });
    log.debug('Created new user: ' + JSON.stringify(user));
    return user;
  }

  /**
   * Update existing user and return new instance.
   *
   * @param from New user prototype
   * @param userId Id of the user.
   * @throws On no user foun {@link NoSuchResource}
   * @returns User as a {@link PublicUser}
   */
  async update(from: Users.Update, userId: number) {
    from.password = await auth.hash(from.password);
    try {
      const user = await this.ctx.prisma.user.update({
        where: { id: userId },
        data: from,
        select: this.publicFields,
      });
      return user;
    } catch (err) {
      log.error(err);
      throw new NoSuchResource(this.TAG);
    }
  }

  /**
   * Updates user's password
   *
   * @param userId Id of the user
   * @param password new password
   * @returns Updated user as a {@link PublicUser}
   */
  async updatePassword(userId: number, password: string) {
    try {
      const user = await this.ctx.prisma.user.update({
        where: { id: userId },
        data: { password },
        select: this.publicFields,
      });
      return user;
    } catch (err) {
      throw new NoSuchResource(this.TAG);
    }
  }

  async emailExists(email: string) {
    try {
      const result = await this.ctx.prisma.user.findFirst({ where: { email } });
      return !result;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Updates user's avatar.
   *
   * @param userId Id of the user.
   * @param newAvatar New avatar for the user (Path).
   * @returns Updated user as a {@link PublicUser}
   */
  async updateAvatar(userId: number, newAvatar: string) {
    try {
      const user = await this.ctx.prisma.user.findFirstOrThrow({
        where: { id: userId },
        select: { profile_img: true },
      });

      const result = await this.ctx.prisma.user.update({
        where: { id: userId },
        data: { profile_img: newAvatar },
        select: this.publicFields,
      });

      if (user.profile_img !== newAvatar) {
        await img.remove(user.profile_img);
      }
      return result;
    } catch (err) {
      throw new BadRequest('');
    }
  }

  /**
   * Checks if user owns specified user resource.
   *
   * @param user User that's trying to access resource.
   * @param userId Target of the check.
   * @returns true if user owns this specified resource.
   */
  async userOwns(user: User, userId: number) {
    try {
      const result = await this.ctx.prisma.user.findFirst({
        where: { id: userId },
      });
      if (result) {
        return result.id === user.id;
      } else {
        throw new NoSuchResource(this.TAG);
      }
    } catch (err) {
      throw err;
    }
  }
}
