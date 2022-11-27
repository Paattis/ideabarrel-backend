import { CommentsClient } from './CommentClient';
import { PrismaContext } from './context';
import { UserClient } from './UserClient';

export class Accessor {
  private readonly _getDbContext: () => PrismaContext;
  private readonly _comments: CommentsClient;
  private readonly _users: UserClient;

  get comments() {
    const actualContext = this._getDbContext();
    return this._comments.withContext(actualContext) as CommentsClient;
  }

  get users() {
    const actualContext = this._getDbContext();
    return this._users.withContext(actualContext) as UserClient;
  }

  constructor(getContex: () => PrismaContext) {
    this._getDbContext = getContex;
    this._comments = new CommentsClient();
    this._users = new UserClient();
  }
}
