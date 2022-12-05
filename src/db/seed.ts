import { PrismaClient, User } from '@prisma/client';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { getAppEnvVar } from '../utils/env';

const prisma = new PrismaClient();
const email = getAppEnvVar('ADMIN_EMAIL');
const password = getAppEnvVar('ADMIN_PW');

const seed = async () => {
  // ************* Clear *************
  // await prisma.user.deleteMany({});
  // await prisma.tag.deleteMany({});
  // await prisma.role.deleteMany({})
  // *******************************

  const tags = [
    { name: 'admin', description: 'Admin' },
    { name: 'Coffee', description: 'Ideas about coffee' },
    { name: 'Office space', description: 'Ideas about office' },
    { name: 'Food', description: 'Ideas about food' },
    { name: 'Software', description: 'Ideas about software' },
    { name: 'Hardware', description: 'Ideas about hardware' },
    { name: 'R&R', description: 'Ideas about R&R' },
    { name: 'New project', description: 'Ideas about a new project' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: { ...tag },
    });
    log.info(`Created tag: ${JSON.stringify(tag)}`);
  }

  const admin: User = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: await auth.hash(password),
      name: 'admin',
      profile_img: '',
      role: { create: { name: 'admin' } },
      tags: { create: { tag: { connect: { name: 'admin' } } } },
    },
  });
  log.info('\n');
  log.info(`Admin id: ${admin.id} email: ${admin.email}   --   password: ${password}`);
  log.info(`JWT:\n${auth.jwt({ id: admin.id, role: admin.role_id })}`);
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error(JSON.stringify(e));
    await prisma.$disconnect();
    process.exit(1);
  });
