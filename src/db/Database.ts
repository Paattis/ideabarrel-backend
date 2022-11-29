import { PrismaClient } from '@prisma/client';
import { PrismaContext } from './context';
import { log } from '../logger/log';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { CommentsClient } from './CommentClient';
import { IdeasClient } from './IdeasClient';
import { LikesClient } from './LikesClient';
import { RolesClient } from './RolesClient';
import { TagsClient } from './TagsClient';
import { UserClient } from './UserClient';

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
  private context: PrismaContext;
  private readonly _comments: CommentsClient;
  private readonly _users: UserClient;
  private readonly _roles: RolesClient;
  private readonly _likes: LikesClient;
  private readonly _tags: TagsClient;
  private readonly _ideas: IdeasClient;

  get comments() {
    return this._comments.withContext(this.context) as CommentsClient;
  }

  get users() {
    return this._users.withContext(this.context) as UserClient;
  }

  get roles() {
    return this._roles.withContext(this.context) as RolesClient;
  }

  get likes() {
    return this._likes.withContext(this.context) as LikesClient;
  }

  get tags() {
    return this._tags.withContext(this.context) as TagsClient;
  }

  get ideas() {
    return this._ideas.withContext(this.context) as IdeasClient;
  }

  constructor(prisma: PrismaClient | DeepMockProxy<PrismaClient> = new PrismaClient()) {
    this.context = {
      prisma,
    };
    this._comments = new CommentsClient();
    this._users = new UserClient();
    this._roles = new RolesClient();
    this._likes = new LikesClient();
    this._tags = new TagsClient();
    this._ideas = new IdeasClient();
  }
}

export enum DbType {
  MOCK_CLIENT,
  MOCK_PRISMA,
}

export type Db = Database | DeepMockProxy<Database>;

let activeType: DbType | undefined;
let instance: Db = new Database();

export function db() {
  return instance;
}

export function dbMock(type: DbType, prisma: DeepMockProxy<PrismaClient> | null = null) {
  switch (type) {
    case DbType.MOCK_CLIENT:
      if (activeType !== DbType.MOCK_CLIENT) {
        log.info('Using MOCK_CLIENT database context');
        instance = mockDeep<Database>();
        activeType = DbType.MOCK_CLIENT;
      }
      break;
    case DbType.MOCK_PRISMA:
      if (activeType !== DbType.MOCK_PRISMA) {
        log.info('Using MOCK_PRISMA database context');
        if (prisma !== null) {
          instance = new Database(prisma);
        } else {
          throw new Error('No prisma mock provided');
        }
        activeType = DbType.MOCK_PRISMA;
      }
      break;
    default:
      break;
  }
  return instance;
}
