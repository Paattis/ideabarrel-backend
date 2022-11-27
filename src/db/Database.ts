import { PrismaClient } from '@prisma/client';
import { PrismaContext } from './context';
import { Accessor } from './Accessor';
import { log } from '../logger/log';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

export namespace Comments {
  export type Create = {
    content: string;
    idea_id: number;
    user_id: number;
  };

  export type Update = {
    content: string;
  };
}

export namespace Likes {
  export type Create = {
    idea_id: number;
    user_id: number;
  };
}

export namespace Ideas {
  export type Create = {
    content: string;
    title: string;
    tags: number[];
  };
  export type Update = {
    content: string;
    title: string;
    tags: number[];
  };
}

export namespace Tags {
  export type Create = {
    name: string;
    description: string;
  };
  export type Delete = {
    name: string;
    description: string;
  };
  export type Update = {
    name: string;
    description: string;
  };
}

export namespace Roles {
  export type Create = {
    name: string;
  };

  export type Update = {
    name: string;
  };
}

export namespace Users {
  export type Create = {
    name: string;
    role_id: number;
    password: string;
    email: string;
    profile_img: string;
  };

  export type Update = {
    name: string;
    role_id: number;
    password: string;
    email: string;
  };
}

export class Database {
  public readonly access = new Accessor(() => this.getActiveContext());
  private activeContext: PrismaContext;

  private getActiveContext() {
    return this.activeContext;
  }

  constructor(prisma: PrismaClient | DeepMockProxy<PrismaClient> = new PrismaClient()) {
    this.activeContext = {
      prisma,
    };
  }
}
export enum DbType {
  REAL_CLIENT,
  MOCK_CLIENT,
  MOCK_PRISMA,
}

export type Db = Database | DeepMockProxy<Database>;

let activeType: DbType | undefined;
let db: Db = new Database();

export function getDb() {
  return db;
}

export function getClient(
  type: DbType = DbType.REAL_CLIENT,
  prisma: DeepMockProxy<PrismaClient> | null = null
) {
  switch (type) {
    case DbType.MOCK_CLIENT:
      if (activeType !== DbType.MOCK_CLIENT) {
        log.info('Using MOCK_CLIENT database context');
        db = mockDeep<Database>();
        activeType = DbType.MOCK_CLIENT;
      }
      break;
    case DbType.REAL_CLIENT:
      if (activeType !== DbType.REAL_CLIENT) {
        log.info('Using REAL_CLIENT database context');
        db = new Database();
        activeType = DbType.REAL_CLIENT;
      }
      break;
    case DbType.MOCK_PRISMA:
      if (activeType !== DbType.MOCK_PRISMA) {
        log.info('Using MOCK_PRISMA database context');
        if (prisma !== null) {
          db = new Database(prisma);
        } else {
          throw new Error('No prisma mock provided');
        }
        activeType = DbType.MOCK_PRISMA;
      }
      break;
    default:
      break;
  }
  return db;
}
