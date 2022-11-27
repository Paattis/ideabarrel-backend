import { CommentsClient } from './CommentClient';
import { PrismaContext } from './context';
import { RolesClient } from './RolesClient';
import { UserClient } from './UserClient';

export class Accessor {
  private readonly _getDbContext: () => PrismaContext;
  private readonly _comments: CommentsClient;
  private readonly _users: UserClient;
  private readonly _roles: RolesClient;

  get comments() {
    const actualContext = this._getDbContext();
    return this._comments.withContext(actualContext) as CommentsClient;
  }

  get users() {
    const actualContext = this._getDbContext();
    return this._users.withContext(actualContext) as UserClient;
  }

  get roles() {
    const actualContext = this._getDbContext();
    return this._roles.withContext(actualContext) as RolesClient;
  }

  constructor(getContex: () => PrismaContext) {
    this._getDbContext = getContex;
    this._comments = new CommentsClient();
    this._users = new UserClient();
    this._roles = new RolesClient();
  }
}
