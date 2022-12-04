import { CommentsClient } from './CommentClient';
import { AppPrismaContext } from './context';
import { IdeasClient } from './IdeasClient';
import { LikesClient } from './LikesClient';




import { RolesClient } from './RolesClient';
import { TagsClient } from './TagsClient';
import { UserClient } from './UserClient';

export class Accessor {
  private readonly _getDbContext: () => AppPrismaContext;
  private readonly _comments: CommentsClient;
  private readonly _users: UserClient;
  private readonly _roles: RolesClient;
  private readonly _likes: LikesClient;
  private readonly _tags: TagsClient;
  private readonly _ideas: IdeasClient;

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

  get tags() {
    const actualContext = this._getDbContext();
    return this._tags.withContext(actualContext) as TagsClient;
  }

  get ideas() {
    const actualContext = this._getDbContext();
    return this._ideas.withContext(actualContext) as IdeasClient;
  }

  constructor(getContex: () => AppPrismaContext) {
    this._getDbContext = getContex;
    this._comments = new CommentsClient();
    this._users = new UserClient();
    this._roles = new RolesClient();
    this._likes = new LikesClient();
    this._tags = new TagsClient();
    this._ideas = new IdeasClient();
  }
}
