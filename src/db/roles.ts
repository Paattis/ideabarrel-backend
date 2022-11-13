import { Role } from '@prisma/client';
import { log } from '../logger/log';
import { PrismaContext } from './context';

export interface NewRole {
  name: string;
}

const all = async (ctx: PrismaContext) => {
  const roles = await ctx.prisma.role.findMany();
  log.debug(`Found ${roles.length} users: [${roles.map((it) => it.name)}]`);
  return roles;
};

const select = async (id: number, ctx: PrismaContext) => {
  const role: Role | null = await ctx.prisma.role.findFirst({ where: { id } });
  if (role == null) {
    log.error(`No role exists with id of ${id}`);
    throw new Error(`No such role exists.`);
  }
  return role;
};

const create = async (from: NewRole, ctx: PrismaContext) => {
  const user = await ctx.prisma.role.create({
    data: { name: from.name },
  });
  log.info('Created new role: ' + JSON.stringify(user));
  return user;
};

export default { all, create, select };
