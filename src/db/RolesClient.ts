import { log } from '../logger/log';
import { NoSuchResource } from '../utils/errors';
import { AbstractClient } from './AbstractClient';
import { Roles } from './client';

export class RolesClient extends AbstractClient {
  public readonly TAG = 'role';
  public readonly publicFields = {
    id: true,
    name: true,
    users: { select: { name: true, id: true } },
  };

  /**
   * Get all roles.
   *
   * @returns Array of {@link Role}s
   */
  async all() {
    return await this.ctx.prisma.role.findMany();
  }

  /**
   * Get all roles, each enriched with users linked
   * liked to them.
   *
   * @returns Array of {@link RoleWithUsers}'
   */
  async allRolesWithUsers() {
    return await this.ctx.prisma.role.findMany({ select: this.publicFields });
  }

  /**
   * Get single role with users linked to it.
   *
   * @param roleId id of the role
   * @throws on missing role {@link NoSuchResource} error.
   * @returns Role as {@link RoleWithUsers}
   */
  async selectWithUsers(roleId: number) {
    try {
      return await this.ctx.prisma.role.findFirstOrThrow({
        where: { id: roleId },
        select: this.publicFields,
      });
    } catch (err) {
      throw new NoSuchResource('role');
    }
  }

  /**
   * Get single role.
   *
   * @param roleId Id of the role
   * @throws on missing role {@link NoSuchResource} error.
   * @returns Role
   */
  async select(roleId: number) {
    try {
      return await this.ctx.prisma.role.findFirstOrThrow({ where: { id: roleId } });
    } catch (err) {
      throw new NoSuchResource('role');
    }
  }

  async exists(roleId: number) {
    try {
        const role = await this.ctx.prisma.role.findFirst({where: {id: roleId}});
        return role !== null;
    } catch (err) {
        throw err;
    }
  }

  /**
   * Create new Role and store it to database.
   *
   * @param from object to build new Role from.
   * @returns Created Role
   */
  async create(from: Roles.Create) {
    try {
      const result = await this.ctx.prisma.role.create({
        data: { name: from.name },
        select: this.publicFields,
      });
      log.info('Created new role: ' + JSON.stringify(result));
      return result;
    } catch (err) {
      throw new Error('Something went wrong');
    }
  }

  async remove(roleId: number) {
    try {
      const result = await this.ctx.prisma.role.delete({
        where: { id: roleId },
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource('role', `No role with id: ${roleId}`);
    }
  }

  async update(roleId: number, role: Roles.Update) {
    try {
      const result = await this.ctx.prisma.role.update({
        where: { id: roleId },
        data: role,
        select: this.publicFields,
      });
      return result;
    } catch (err) {
      throw new NoSuchResource('role', `No role with id: ${roleId}`);
    }
  }
}
