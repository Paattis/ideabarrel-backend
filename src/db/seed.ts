import { PrismaClient, Role, User } from '@prisma/client';
import { log } from '../logger/log';
import auth from '../utils/auth';
import { getAppEnvVar } from '../utils/env';

const prisma = new PrismaClient();
const email = getAppEnvVar('ADMIN_EMAIL');
const password = getAppEnvVar('ADMIN_PW');

const seed = async () => {
  const adminRole: Role = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'admin' },
  });

  const admin: User = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: await auth.hash(password),
      name: 'admin',
      profile_img: '',
      role_id: adminRole.id,
    },
  });

  log.info(`Admin email: ${admin.email}   --   password: ${password}`);

  const tag = await prisma.tag.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'admin', description: 'none' },
  });

  log.info(`Created tag: ${JSON.stringify(tag)}`);
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    log.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
