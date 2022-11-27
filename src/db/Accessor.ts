import { CommentsClient } from './CommentClient';
import { PrismaContext } from './context';
import { LikesClient } from './LikesClient';
import { RolesClient } from './RolesClient';
import { UserClient } from './UserClient';

export class Accessor {
  private readonly _getDbContext: () => PrismaContext;
  private readonly _comments: CommentsClient;
  private readonly _users: UserClient;
  private readonly _roles: RolesClient;
  private readonly _likes: LikesClient;

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

  get likes() {
    const actualContext = this._getDbContext();
    return this._likes.withContext(actualContext) as LikesClient;
  }

  constructor(getContex: () => PrismaContext) {
    this._getDbContext = getContex;
    this._comments = new CommentsClient();
    this._users = new UserClient();
    this._roles = new RolesClient();
    this._likes = new LikesClient();
  }
}
